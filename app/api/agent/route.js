export const dynamic = 'force-dynamic';
export async function GET(req){
  const u = new URL(req.url);
  const force = u.searchParams.get('force')==='true';
  const BREVO = (process.env.BREVO_API_KEY||'').trim();
  const SUPA_URL = (process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'').trim();
  // PREFER LEGACY eyJ KEY - this is the WORKING one for REST
  const SUPA_KEY = (
    process.env.SUPABASE_ANON_KEY||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||
    process.env.SUPABASE_PUBLISHABLE_KEY||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||
    ''
  ).trim();

  const dbg={
    using_url: SUPA_URL.slice(0,50),
    using_key_type: SUPA_KEY.startsWith('eyJ')?'eyJ LEGACY (CORRECT FOR REST)':SUPA_KEY.startsWith('sb_')?'sb_publishable (NEW)':'unknown',
    using_key_len: SUPA_KEY.length,
    using_key_prefix: SUPA_KEY.slice(0,30),
    filter:'Full Stack AI - PREFERS eyJ LEGACY',
    scraped:0, filtered_count:0, skipped_dupes:0, emails_sent:0, sent_jobs:[],
    supabase_debug:null, time:new Date().toISOString()
  };

  try{
    const r= await fetch('https://remoteok.com/api',{headers:{'User-Agent':'Mozilla/5.0'},cache:'no-store'});
    const raw= await r.json();
    const jobs= raw.slice(1).filter(j=>j&&j.position&&j.company);
    dbg.scraped=jobs.length;
    let filtered= jobs.filter(j=>{
      const t=((j.position||'')+' '+(j.tags||[]).join(' ')).toLowerCase();
      return t.includes('full stack');
    }).slice(0,5);
    dbg.filtered_count=filtered.length;

    let seen=new Set();
    try{
      const res= await fetch(`${SUPA_URL}/rest/v1/sent_jobs?select=job_id&limit=100`,{
        headers:{apikey:SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}`}
      });
      const txt= await res.text();
      dbg.supabase_debug={status:res.status, body:txt.slice(0,400)};
      if(res.ok){ JSON.parse(txt).forEach(s=>seen.add(String(s.job_id))); }
    }catch(e){ dbg.supabase_debug={error:e.message}; }

    let toSend= force? filtered : filtered.filter(j=>!seen.has(String(j.id)));
    dbg.skipped_dupes= filtered.length - toSend.length;
    toSend= toSend.slice(0,1);

    if(toSend.length===0) return Response.json({...dbg, message:'No new jobs - dedup working, no duplicate email sent'});

    for(const job of toSend){
      const html=`<h2>${job.position} @ ${job.company}</h2><p>Autonomous agent Full Stack AI demo. Resume: https://job-agents-real.vercel.app/resume.pdf</p><p>${job.url}</p>`;
      const brevoRes= await fetch('https://api.brevo.com/v3/smtp/email',{
        method:'POST',
        headers:{'accept':'application/json','content-type':'application/json','api-key':BREVO},
        body: JSON.stringify({
          sender:{name:'Ron Kahn', email: process.env.BREVO_SENDER_EMAIL||'ron@job-agents-real.vercel.app'},
          to:[{email:'venusailux@gmail.com'}],
          subject:`Autonomous: ${job.position} @ ${job.company}`,
          htmlContent: html
        })
      });
      const bData= await brevoRes.json();
      if(brevoRes.ok){
        dbg.emails_sent++; dbg.sent_jobs.push(`${job.position} @ ${job.company} - ${job.id}`);
        try{
          await fetch(`${SUPA_URL}/rest/v1/sent_jobs`,{
            method:'POST',
            headers:{apikey:SUPA_KEY, Authorization:`Bearer ${SUPA_KEY}`,'Content-Type':'application/json', Prefer:'return=minimal'},
            body: JSON.stringify({job_id:String(job.id), company:job.company, position:job.position})
          });
        }catch{}
      }
    }
    return Response.json(dbg);
  }catch(e){ return Response.json({ok:false, error:e.message, ...dbg},{status:500}); }
}
