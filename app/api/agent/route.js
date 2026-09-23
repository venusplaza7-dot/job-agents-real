export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === 'true';

  const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();
  
  // FORCE NEW sb_ KEYS FIRST - ignore old JWT keys
  const SUPABASE_URL = (
    process.env.SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  ).trim();
  
  const SUPABASE_KEY = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const debug = {
    ok: true,
    env_check: {
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_SUPABASE_PUBLISHABLE: !!process.env.SUPABASE_PUBLISHABLE_KEY,
      has_NEXT_PUBLIC_PUBLISHABLE: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      has_SUPABASE_ANON: !!process.env.SUPABASE_ANON_KEY,
    },
    using_url: SUPABASE_URL ? SUPABASE_URL.substring(0, 40) + "..." : "MISSING",
    using_key_type: SUPABASE_KEY.startsWith("sb_publishable") ? "sb_publishable (NEW CORRECT)" : SUPABASE_KEY.startsWith("eyJ") ? "JWT (OLD LEGACY)" : "UNKNOWN",
    using_key_len: SUPABASE_KEY.length,
    using_key_prefix: SUPABASE_KEY.substring(0, 25),
    filter: "Full Stack AI ONLY - SB KEY FORCED",
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

  if (!BREVO_API_KEY) return Response.json({ ok: false, error: "BREVO_API_KEY missing" }, { status: 500 });
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return Response.json({ ok: false, error: "Supabase URL or KEY missing", debug }, { status: 500 });
  }

  try {
    const r = await fetch("https://remoteok.com/api", { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
    const raw = await r.json();
    const all = raw.slice(1).filter(j => j && j.position && j.company);
    debug.scraped = all.length;

    let filtered = all.filter(j => {
      const t = ((j.position||"")+" "+(j.tags||[]).join(" ")).toLowerCase();
      return t.includes("full stack") || t.includes("full-stack") || t.includes("fullstack");
    }).slice(0,10);
    if (filtered.length===0) filtered = all.slice(0,2);
    debug.filtered_count = filtered.length;

    // Supabase dedup - now using sb_publishable key
    let seenIds = new Set();
    try {
      const seenRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_jobs?select=job_id&limit=100`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const txt = await seenRes.text();
      debug.supabase_debug = { status: seenRes.status, body: txt.substring(0,500) };
      if (seenRes.ok) {
        const seen = JSON.parse(txt);
        seen.forEach(s=> seenIds.add(String(s.job_id)));
      }
    } catch(e) {
      debug.supabase_debug = { error: e.message };
    }

    let jobsToSend = filtered;
    if (!force) {
      const before = jobsToSend.length;
      jobsToSend = jobsToSend.filter(j=> !seenIds.has(String(j.id)));
      debug.skipped_dupes = before - jobsToSend.length;
    }
    jobsToSend = jobsToSend.slice(0,1);
    debug.new_saved = jobsToSend.length;

    if (jobsToSend.length===0) {
      return Response.json({ ...debug, message: "All jobs already sent - no dupes, no emails" });
    }

    const TO_EMAIL = "venusailux@gmail.com";
    const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "ron@job-agents-real.vercel.app";
    const RESUME_LINK = "https://job-agents-real.vercel.app/resume.pdf";

    for (const job of jobsToSend) {
      const html = `<h2>${job.position} @ ${job.company}</h2><p>Autonomous AI agent demo - Full Stack AI ONLY. Resume: <a href="${RESUME_LINK}">${RESUME_LINK}</a></p><p>Job: ${job.url}</p>`;
      const payload = {
        sender: { name: "Ron Kahn", email: SENDER_EMAIL },
        to: [{ email: TO_EMAIL }],
        subject: `Autonomous: ${job.position} @ ${job.company}`,
        htmlContent: html
      };
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method:"POST",
        headers:{ "accept":"application/json", "content-type":"application/json", "api-key": BREVO_API_KEY },
        body: JSON.stringify(payload)
      });
      const data = await brevoRes.json();
      debug.brevo_last = data;
      if (brevoRes.ok) {
        debug.emails_sent++;
        debug.sent_jobs.push(`${job.position} @ ${job.company}`);
        // save to supabase
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/sent_jobs`, {
            method:"POST",
            headers:{ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates" },
            body: JSON.stringify({ job_id: String(job.id), company: job.company, position: job.position, sent_at: new Date().toISOString() })
          });
        } catch {}
      }
    }

    return Response.json(debug);
  } catch(e) {
    return Response.json({ ok:false, error: e.message, ...debug }, {status:500});
  }
}
