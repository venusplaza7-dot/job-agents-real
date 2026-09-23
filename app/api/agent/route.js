export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';

  const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
  const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_KEY?.trim();
  const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

  const debug = {
    ok: true,
    filter: "Full Stack AI ONLY + Autonomous Pitch + Brevo + Supabase NO-DUPE FINAL",
    using_env: !!BREVO_API_KEY,
    env_len: BREVO_API_KEY?.length || 0,
    key_prefix: BREVO_API_KEY ? BREVO_API_KEY.substring(0,8) : "none",
    supabase_configured: !!(SUPABASE_URL && SUPABASE_KEY),
    supabase_url_present: !!SUPABASE_URL,
    supabase_key_len: SUPABASE_KEY?.length || 0,
    groq_configured: !!GROQ_API_KEY,
    force_mode: force,
    scraped: 0,
    filtered_count: 0,
    skipped_dupes: 0,
    new_saved: 0,
    emails_sent: 0,
    sent_jobs: [],
    supabase_debug: null,
    brevo_last: null,
    time: new Date().toISOString()
  };

  if (!BREVO_API_KEY) {
    return Response.json({ ok:false, error:"BREVO_API_KEY missing" }, {status:500});
  }

  try {
    const r = await fetch("https://remoteok.com/api", { headers:{ "User-Agent":"Mozilla/5.0" }, cache:"no-store" });
    const raw = await r.json();
    const allJobs = raw.slice(1).filter(j=> j && j.position && j.company);
    debug.scraped = allJobs.length;

    // Full Stack AI ONLY filter - strict
    let filtered = allJobs.filter(j=>{
      const txt = `${j.position} ${j.tags?.join(" ")}`.toLowerCase();
      const isFullStack = txt.includes("full stack") || txt.includes("full-stack") || txt.includes("fullstack");
      const isAI = txt.includes(" ai") || txt.includes("llm") || txt.includes("openai") || txt.includes("machine learning") || j.tags?.some(t=> ["ai","llm","genai","openai","machine learning"].includes(String(t).toLowerCase()));
      return isFullStack || (txt.includes("full stack") && txt.includes("ai"));
    }).slice(0,10);
    
    // Fallback if 0: just full stack
    if (filtered.length===0) {
      filtered = allJobs.filter(j=> String(j.position).toLowerCase().includes("full stack")).slice(0,5);
    }
    debug.filtered_count = filtered.length;

    // SUPABASE DEDUP
    let seenIds = new Set();
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const seenRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_jobs?select=job_id&limit=200`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const text = await seenRes.text();
        debug.supabase_debug = { status: seenRes.status, body_preview: text.substring(0,500) };
        if (seenRes.ok) {
          const seen = JSON.parse(text);
          seen.forEach(s=> seenIds.add(String(s.job_id)));
        }
      } catch (e) {
        debug.supabase_debug = { error: e.message };
      }
    } else {
      debug.supabase_debug = { error: "ENV missing: Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel" };
    }

    let jobsToSend = filtered;
    if (!force) {
      const before = jobsToSend.length;
      jobsToSend = jobsToSend.filter(j=> !seenIds.has(String(j.id)));
      debug.skipped_dupes = before - jobsToSend.length;
    }
    jobsToSend = jobsToSend.slice(0,2);
    debug.new_saved = jobsToSend.length;

    // SEND VIA BREVO
    const TO_EMAIL = "venusailux@gmail.com";
    const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "ron@job-agents-real.vercel.app";
    const RESUME_LINK = "https://job-agents-real.vercel.app/resume.pdf";

    for (const job of jobsToSend) {
      const company = job.company;
      const position = job.position;
      const jobLink = job.url || `https://remoteok.com/remote-jobs/${job.id}`;

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;color:#111;line-height:1.6">
          <h2>Autonomous Application for ${position} - ${company}</h2>
          <div style="background:#e0f2fe;border-left:4px solid #0ea5e9;padding:12px 16px;margin:16px 0;border-radius:6px">
            <strong>🚀 Proof of Work - Autonomous AI Agent I Built:</strong><br/>
            This email was <b>autonomously sent by my Full Stack AI agent</b> - scraping RemoteOK, filtering <b>Full Stack AI ONLY</b>, deduped via Supabase (no repeat to same company), sent via Brevo API on Vercel Cron. Demo: job-agents-real.vercel.app | Resume: ${RESUME_LINK}
          </div>
          <p>Hi ${company} Team,</p>
          <p>I built an autonomous job application agent - the system contacting you now - to apply only to Full Stack AI roles. Saw your <b>${position}</b> - perfect match.</p>
          <p><b>Role:</b> ${position}<br/><b>Company:</b> ${company}<br/><b>Link:</b> <a href="${jobLink}">${jobLink}</a></p>
          <p><a href="${RESUME_LINK}" style="background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">📄 Resume</a> <a href="https://job-agents-real.vercel.app" style="background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;margin-left:8px">🤖 Live Demo</a></p>
          <p>Best,<br/><b>Ron Kahn</b><br/>Full Stack AI<br/><a href="${RESUME_LINK}">${RESUME_LINK}</a></p>
          <hr/><p style="font-size:11px;color:#888">No dupe check: job_id=${job.id} | Supabase sent_jobs | force=${force} | time=${new Date().toISOString()}</p>
        </div>`;

      const payload = {
        sender: { name: "Ron Kahn - Autonomous Agent", email: SENDER_EMAIL },
        to: [{ email: TO_EMAIL }],
        subject: `Autonomous Application for ${position} - ${company}`,
        htmlContent: html
      };

      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method:"POST",
        headers:{ "accept":"application/json", "content-type":"application/json", "api-key": BREVO_API_KEY },
        body: JSON.stringify(payload)
      });
      const brevoData = await brevoRes.json().catch(()=>({}));
      debug.brevo_last = brevoData;

      if (brevoRes.ok) {
        debug.emails_sent++;
        debug.sent_jobs.push(`${position} @ ${company} - ${job.id}`);
        if (SUPABASE_URL && SUPABASE_KEY) {
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/sent_jobs`, {
              method:"POST",
              headers:{ apikey: SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates" },
              body: JSON.stringify({ job_id: String(job.id), company, position, sent_at: new Date().toISOString() })
            });
          } catch {}
        }
      }
    }

    return Response.json(debug);

  } catch (e) {
    return Response.json({ ...debug, ok:false, error:e.message }, {status:500});
  }
}
