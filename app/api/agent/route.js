export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// HARD CODED - Working now that repo is private
const GROQ_API_KEY = "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";
const SUPABASE_URL = "https://ekubsfgyuqziizfjmcsk.supabase.co/rest/v1/"; 
const SUPABASE_KEY = "sb_publishable_kHr0-nudVWjliHw_owPm7A_G1NA4i8o"; // REPLACE THIS
const BREVO_KEY = "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";
export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // AUTO SCRAPE - RemoteOK AI Remote Jobs
    const r = await fetch("https://remoteok.com/api?tag=ai", { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await r.json();
    const jobs = data.slice(1, 8).map(j => ({
      title: j.position,
      company: j.company,
      url: j.url,
      location: j.location || "Remote",
      description: (j.description || "").substring(0, 3500)
    }));

    let saved = 0;
    for (const job of jobs) {
      if (!job.title) continue;
      const { data: exists } = await supabase.from('jobs').select('id').eq('url', job.url).limit(1);
      if (exists?.length) continue;

      // TAILOR RESUME with Groq gpt-oss-20b
      const groq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: "You are a senior AI Developer resume expert. Tailor resume for remote AI job. Return JSON only." },
            { role: "user", content: `JOB: ${job.title} at ${job.company}\nDESC: ${job.description}\n\nBASE PROFILE: 5 years AI Developer, Python, Next.js, LangChain, Groq, OpenAI API, Supabase, Vercel, RAG, Agents.\n\nReturn JSON: { tailored_resume: "3 bullet points", cover_letter: "short 100 words", match_score: 85 }` }
          ],
          response_format: { type: "json_object" }
        })
      });
      const gj = await groq.json();
      let ai = {};
      try { ai = JSON.parse(gj.choices?.[0]?.message?.content || "{}"); } catch {}

      await supabase.from('jobs').insert({
        
        await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    sender: { email: SENDER_EMAIL },
    to: [{ email: BCC_EMAIL }],
    bcc: [{ email: BCC_EMAIL }],
    subject: `Application: ${job.title} at ${job.company}`,
    htmlContent: `...`
  })
});: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        tailored_resume: ai.tailored_resume || "",
        cover_letter: ai.cover_letter || "",
        match_score: ai.match_score || 0,
        status: "new"
      });
      saved++;
    }

    return Response.json({ ok: true, scraped: jobs.length, new_saved: saved, groq_works: true, time: new Date().toISOString() });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
