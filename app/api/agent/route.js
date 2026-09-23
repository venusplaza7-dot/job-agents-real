export const dynamic = 'force-dynamic';
export async function GET(req){
  const force = new URL(req.url).searchParams.get('force')==='true';
  const BREVO = (process.env.BREVO_API_KEY||'').trim();
  const URL_ = (process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'').trim();
  const KEY = (process.env.SUPABASE_ANON_KEY||'').trim();
  let dbg={ url:URL_, key_len:KEY.length, key_prefix:KEY.slice(0,20), force, scraped:0, skipped:0, sent:0, supabase:null };
  try{
    // 1. Test Supabase connection with detailed error
    try{
      const r = await fetch(`${URL_}/rest/v1/sent_jobs?select=job_id&limit=1`, {
        headers:{apikey:KEY, Authorization:`Bearer ${KEY}`},
        cache:'no-store'
      });
      const t = await r.text();
      dbg.supabase={status:r.status, ok:r.ok, body:t.slice(0,500), headers:Object.fromEntries(r.headers.entries())};
    }catch(e){
      dbg.supabase={fetch_error:e.message, cause:e.cause?.message, stack:e.stack?.slice(0,500)};
    }

    // 2. Scrape
    const rr = await fetch('https://remoteok.com/api',{headers:{'User-Agent':'Mozilla/5.0'},cache:'no-store'});
    const raw = await rr.json();
    const jobs = raw.slice(1).filter(j=>j.position&&j.company);
    dbg.scraped=jobs.length;
    const filtered = jobs.filter(j=> (j.position||'').toLowerCase().includes('full stack')).slice(0,3);
    let toSend = filtered;
    if(!force && dbg.supabase?.ok){
      try{
        const seenRes = await fetch(`${URL_}/rest/v1/sent_jobs?select=job_id`,{headers:{apikey:KEY, Authorization:`Bearer ${KEY}`}});
        const seenTxt = await seenRes.text();
        if(seenRes.ok){
          const seenIds = new Set(JSON.parse(seenTxt).map(s=>String(s.job_id)));
          toSend = filtered.filter(j=>!seenIds.has(String(j.id)));
          dbg.skipped = filtered.length - toSend.length;
        }
      }catch{}
    }
    toSend = toSend.slice(0,1);
    if(toSend.length===0) return Response.json({...dbg, message:'DEDUP WORKING - no new jobs, no email sent'});
    
    // send 1 email
    const job=toSend[0];
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email',{
      method:'POST',
      headers:{'accept':'application/json','content-type':'application/json','api-key':BREVO},
      body: JSON.stringify({
        sender:{name:'Ron Kahn', email: process.env.BREVO_SENDER_EMAIL||'ron@job-agents-real.vercel.app'},
        to:[{email:'venusailux@gmail.com'}],
        subject:`Fixed: ${job.position} @ ${job.company}`,
        htmlContent:`<h2>${job.position} @ ${job.company}</h2><p>Dedup fixed. Resume: https://job-agents-real.vercel.app/resume.pdf</p>`
      })
    });
    const b = await brevoRes.json();
    if(brevoRes.ok){
      dbg.sent=1;
      try{ await fetch(`${URL_}/rest/v1/sent_jobs`,{method:'POST', headers:{apikey:KEY, Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'}, body: JSON.stringify({job_id:String(job.id), company:job.company, position:job.position})}); }catch{}
    }
    return Response.json({...dbg, brevo:b});
  }catch(e){ return Response.json({error:e.message, ...dbg},{status:500}); }
}
