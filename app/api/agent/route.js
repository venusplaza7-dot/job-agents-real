export const dynamic = 'force-dynamic';

async function fetchAllJobs(){
  let all=[];
  try{
    const r= await fetch('https://remoteok.com/api',{headers:{'User-Agent':'Mozilla/5.0'},cache:'no-store'});
    const raw= await r.json();
    raw.slice(1).forEach(j=>{
      if(j.position && j.company) all.push({id:`rok-${j.id}`, company:j.company, position:j.position, url:j.url||`https://remoteok.com/remote-jobs/${j.id}`, tags:j.tags||[], source:'RemoteOK'});
    });
  }catch{}
  try{
    const r= await fetch('https://www.arbeitnow.com/api/job-board-api?search=full%20stack%20ai%20engineer&remote=true',{headers:{'User-Agent':'Mozilla/5.0'}});
    const d= await r.json();
    (d.data||[]).forEach(j=> all.push({id:`arb-${j.slug}`, company:j.company_name, position:j.title, url:j.url, tags:j.tags||[], source:'Arbeitnow (LinkedIn+X+FB aggregated)'}));
  }catch{}
  try{
    const r= await fetch('https://remotive.com/api/remote-jobs?category=software-dev&search=full%20stack%20ai',{headers:{'User-Agent':'Mozilla/5.0'}});
    const d= await r.json();
    (d.jobs||[]).forEach(j=> all.push({id:`rem-${j.id}`, company:j.company_name, position:j.title, url:j.url, tags:j.tags||[], source:'Remotive (LinkedIn+X)'}));
  }catch{}
  return all;
}
function isFullStackAI(j){
  const t=(j.position+' '+(j.tags||[]).join(' ')+' '+j.company).toLowerCase();
  return (t.includes('full stack') || t.includes('full-stack') || t.includes('fullstack') || t.includes('mern') || t.includes('next.js')) && (t.includes('ai') || t.includes('llm') || t.includes('rag') || t.includes('genai'));
}

export async function GET(req){
  const u = new URL(req.url);
  const force = u.searchParams.get('force')==='true';
  const BREVO = (process.env.BREVO_API_KEY||'').trim();
  const SUPA_URL = (process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'').trim();
  const SUPA_KEY = (process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'').trim();
  const SENDER_EMAIL = (process.env.BREVO_SENDER_EMAIL||'ron@venushq7.com').trim();
  const SENDER_NAME = process.env.BREVO_SENDER_NAME||'Ron Kahn';

  const dbg={sender:SENDER_EMAIL, total_scraped:0, filtered:0, skipped_jobid:0, skipped_company:0, sent:0, jobs:[], companies_already_contacted:[], time:new Date().toISOString()};

  try{
    let jobs = await fetchAllJobs();
    dbg.total_scraped=jobs.length;
    let filtered = jobs.filter(isFullStackAI);
    const uniq=new Map(); filtered.forEach(j=>{ const k=j.company.toLowerCase().trim(); if(!uniq.has(k)) uniq.set(k,j); });
    filtered=[...uniq.values()];
    dbg.filtered=filtered.length;

    let sentIds=new Set(); let sentCompanies=new Set();
    try{
      const res= await fetch(`${SUPA_URL}/rest/v1/sent_jobs?select=job_id,company&order=sent_at.desc&limit=300`,{
        headers:{apikey:SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}`}
      });
      if(res.ok){
        const data= await res.json();
        data.forEach(s=>{ sentIds.add(String(s.job_id)); if(s.company) sentCompanies.add(s.company.toLowerCase().trim()); });
        dbg.companies_already_contacted=[...sentCompanies].slice(0,15);
      }
    }catch{}

    let toSend = filtered.filter(j=>{
      if(sentIds.has(String(j.id))){ dbg.skipped_jobid++; return false; }
      if(!force && sentCompanies.has(j.company.toLowerCase().trim())){ dbg.skipped_company++; return false; }
      return true;
    }).slice(0,2);

    if(toSend.length===0) return Response.json({ok:true, ...dbg, message:`DEDUP BY COMPANY OK - No new companies. All ${filtered.length} Full Stack AI companies already contacted.`});

    for(const job of toSend){
      const html=`<div style="font-family:Arial;line-height:1.5"><p>Hi ${job.company} team,</p><p>I'm <b>Ron Kahn</b> – Full Stack AI Engineer (remote, GMT+5). I build autonomous agents, RAG, Next.js + Supabase + LLMs + Brevo.</p><p><b>Live demo that found you:</b> job-agents-real.vercel.app – multi-source agent scraping RemoteOK, Remotive, Arbeitnow (which aggregates LinkedIn, X, Facebook jobs).</p><p>Role: <b>${job.position}</b><br>Link: <a href="${job.url}">${job.url}</a><br>Source: ${job.source}</p><p>Resume: https://job-agents-real.vercel.app/resume.pdf<br>LinkedIn: https://linkedin.com/in/ronkahn<br>GitHub: https://github.com/ronkahn</p><p>Open to 15-min chat this week?</p><p>Best,<br>Ron Kahn<br>${SENDER_EMAIL}</p></div>`;

      const brevoRes= await fetch('https://api.brevo.com/v3/smtp/email',{
        method:'POST',
        headers:{'accept':'application/json','content-type':'application/json','api-key':BREVO},
        body: JSON.stringify({
          sender:{name:SENDER_NAME, email:SENDER_EMAIL},
          to:[{email:'venusailux@gmail.com', name:'Venus'}],
          subject:`Full Stack AI Engineer – ${job.position} @ ${job.company}`,
          htmlContent: html,
          replyTo:{email:SENDER_EMAIL, name:SENDER_NAME}
        })
      });
      const bData= await brevoRes.json();
      if(brevoRes.ok){
        dbg.sent++; dbg.jobs.push(`${job.company} | ${job.position} | ${job.source}`);
        await fetch(`${SUPA_URL}/rest/v1/sent_jobs`,{
          method:'POST',
          headers:{apikey:SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}`,'Content-Type':'application/json', Prefer:'return=minimal'},
          body: JSON.stringify({job_id:String(job.id), company:job.company, position:job.position, url:job.url})
        });
      } else { dbg.brevo_error=bData; }
    }
    return Response.json({...dbg, ok:true});
  }catch(e){ return Response.json({ok:false, error:e.message, ...dbg},{status:500}); }
}
