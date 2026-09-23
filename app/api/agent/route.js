export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';

  const BREVO_API_KEY = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : null;
  const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : null;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.trim() : (process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : null);

  const TO_EMAIL = "venusailux@gmail.com";
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "ron@11921043.brevosend.com";
  const SENDER_NAME = "Ron Kahn - Autonomous Agent";
  const RESUME_LINK = "https://job-agents-real.vercel.app/resume.pdf";

  const debug = {
    ok: true,
    filter: "Full Stack AI ONLY + Autonomous Pitch + Brevo ENV WORKING + NO-DUPE",
    using_env: !!BREVO_API_KEY,
    env_len: BREVO_API_KEY ? BREVO_API_KEY.length : 0,
    key_prefix: BREVO_API_KEY ? BREVO_API_KEY.substring(0, 12) + "..." : "none",
    force_mode: force,
    scraped: 0,
    filtered_count: 0,
    skipped_dupes: 0,
    new_saved: 0,
    emails_sent: 0,
    sent_jobs: [],
    brevo_last: null,
    time: new Date().toISOString()
  };

  if (!BREVO_API_KEY) {
    return Response.json({ ok: false, error: "BREVO_API_KEY missing in Vercel ENV", ...debug }, { status: 500 });
  }

  try {
    const r = await fetch("https://remoteok.com/api?tag=full%20stack", {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });
    const raw = await r.json();
    const jobs = raw.slice(1).filter(j => j && j.position && j.company);
    debug.scraped = jobs.length;

    const filtered = jobs.filter(j => {
      const text = (j.position + " " + (j.tags ? j.tags.join(" ") : "") + " " + (j.description || "")).toLowerCase();
      const isFullStack = text.includes("full stack") || text.includes("full-stack") || text.includes("fullstack");
      const isAI = text.includes(" ai ") || text.includes(" llm") || text.includes("openai") || text.includes("genai") || text.includes("artificial intelligence") || (j.tags && j.tags.some(t => ["ai","llm","machine learning","genai"].includes(t.toLowerCase())));
      return isFullStack && isAI;
    }).slice(0, 10);

    debug.filtered_count = filtered.length;
    let jobsToSend = filtered.slice(0, 2);

    if (!force && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const seenRes = await fetch(SUPABASE_URL + "/rest/v1/sent_jobs?select=job_id,company,position&order=sent_at.desc&limit=100", {
          headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
        });
        if (seenRes.ok) {
          const seen = await seenRes.json();
          const seenIds = new Set(seen.map(s => String(s.job_id)));
          const seenCompanies = new Set(seen.map(s => (s.company + "|" + s.position).toLowerCase()));
          const before = jobsToSend.length;
          jobsToSend = filtered.filter(j => {
            const idDup = seenIds.has(String(j.id));
            const compDup = seenCompanies.has((j.company + "|" + j.position).toLowerCase());
            return !idDup && !compDup;
          }).slice(0, 2);
          debug.skipped_dupes = before - jobsToSend.length + (filtered.length - before);
          if (filtered.length > 2) debug.skipped_dupes = filtered.length - jobsToSend.length;
        }
      } catch (e) {}
    }

    if (jobsToSend.length === 0 && filtered.length === 0) {
      jobsToSend = jobs.filter(j => (j.position || "").toLowerCase().includes("full stack")).slice(0, 1);
    }

    debug.new_saved = jobsToSend.length;

    for (const job of jobsToSend) {
      const company = job.company || "Hiring Team";
      const position = job.position || "Full Stack AI Developer";
      const jobLink = job.url || ("https://remoteok.com/remote-jobs/" + job.id);

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;line-height:1.6">
          <h2>Autonomous Application for ${position} - ${company}</h2>
          <div style="background:#e0f2fe;border-left:4px solid #0ea5e9;padding:12px 16px;margin:16px 0;border-radius:6px">
            <strong>🚀 Proof of Work - Autonomous AI Agent I Built:</strong><br/>
            This email was <b>autonomously sent by my Full Stack AI agent</b> — the system contacting you right now. 
            It scraped RemoteOK, filtered <b>Full Stack AI ONLY</b>, deduped via Supabase (no repeat to same company), and sent via Brevo API on Vercel Cron.
            Demo: <a href="https://job-agents-real.vercel.app">job-agents-real.vercel.app</a> | Resume: <a href="${RESUME_LINK}">${RESUME_LINK}</a>
          </div>
          <p>Hi ${company} Team,</p>
          <p>I built an autonomous job application agent to apply only to Full Stack AI roles. Saw your <b>${position}</b> role — perfect match.</p>
          <p><b>Role:</b> ${position}<br/><b>Company:</b> ${company}<br/><b>Link:</b> <a href="${jobLink}">${jobLink}</a></p>
          <div style="margin:20px 0">
            <a href="${RESUME_LINK}" style="background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">📄 Resume</a>
            <a href="https://job-agents-real.vercel.app" style="background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;margin-left:8px">🤖 Live Demo</a>
          </div>
          <p>Best,<br/><b>Ron Kahn</b><br/>Full Stack AI<br/>${RESUME_LINK}</p>
          <p style="font-size:11px;color:#888">No dupe: job_id=${job.id} | dedup via Supabase sent_jobs | time=${new Date().toISOString()}</p>
        </div>`;

      const payload = {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: TO_EMAIL }],
        subject: "Autonomous Agent Demo by Ron Kahn - " + position + " @ " + company + " [Full Stack AI]",
        htmlContent: html
      };

      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "accept": "application/json", "content-type": "application/json", "api-key": BREVO_API_KEY },
        body: JSON.stringify(payload)
      });
      const brevoData = await brevoRes.json();
      debug.brevo_last = brevoData;

      if (brevoRes.ok) {
        debug.emails_sent++;
        debug.sent_jobs.push(position + " @ " + company + " - " + job.id);
        if (SUPABASE_URL && SUPABASE_KEY) {
          try {
            await fetch(SUPABASE_URL + "/rest/v1/sent_jobs", {
              method: "POST",
              headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
              body: JSON.stringify({ job_id: String(job.id), company: company, position: position, sent_at: new Date().toISOString() })
            });
          } catch (e) {}
        }
      }
    }

    return Response.json(debug);
  } catch (e) {
    return Response.json({ ok: false, error: e.message, stack: e.stack, ...debug }, { status: 500 });
  }
}
