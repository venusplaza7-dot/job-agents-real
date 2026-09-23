export const dynamic='force-dynamic';
export const runtime='nodejs';
const GROQ_API_KEY="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";
const SUPABASE_URL="https://ekubsfgyuqziizfjmcs-k.supabase.co";
const SUPABASE_KEY="sb_publishable_kHr0-nudVWjliHw_owPm7A_G1NA4i8o";
// CACHE BUSTER 2026-09-22-v4 - Force Vercel rebuild
const BREVO_API_KEY_RAW = process.env.BREVO_API_KEY;
const BREVO_API_KEY = BREVO_API_KEY_RAW ? BREVO_API_KEY_RAW.trim() : null;
const SENDER_EMAIL="ron@venushq7.com";
const BCC_EMAIL="venusailux@gmail.com";
const RESUME_LINK="https://job-agents-real.vercel.app/resume.pdf";

function isFullStackAI(job){
  const t=(job.position||"").toLowerCase();
  return t.includes("full stack") || t.includes("full-stack") || t.includes("fullstack") || t.includes("ai engineer") || t.includes("ai developer");
}
function cleanCoverLetter(text){
  if(!text) return "";
  let lines=text.split("\n").filter(l=>l.trim().length>0);
  let seenDear=false; let cleaned=[];
  for(let l of lines){
    if(l.toLowerCase().includes("dear ")){
      if(!seenDear){ cleaned.push(l); seenDear=true; }
      continue;
    }
    cleaned.push(l);
  }
  return cleaned.join("\n\n");
}
export async function GET(){
  try{
    // DIAGNOSTIC - show if env loaded (not the key itself)
    if(!BREVO_API_KEY){
      return new Response(JSON.stringify({
        ok:false,
        error:"ENV still empty",
        debug:{
          BREVO_API_KEY_exists: !!BREVO_API_KEY_RAW,
          BREVO_API_KEY_len: BREVO_API_KEY_RAW ? BREVO_API_KEY_RAW.length : 0,
          all_env_keys: Object.keys(process.env).filter(k=>k.includes("BREVO")),
          vercel_env: process.env.VERCEL_ENV,
          hint:"Go to Vercel -> job-agents-real -> Settings -> Environment Variables -> Add BREVO_API_KEY -> Save -> Deployments -> ... -> Redeploy -> UNCHECK 'Use existing Build Cache'"
        }
      }),{status:500,headers:{"Content-Type":"application/json"}});
    }

    const {createClient}=await import('@supabase/supabase-js');
    const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
    const r=await fetch("https://remoteok.com/api",{headers:{"User-Agent":"Mozilla/5.0"}});
    const all=await r.json();
    let filtered=all.slice(1).filter(isFullStackAI);
    if(filtered.length===0) filtered=all.slice(1).filter(j=>/full stack/i.test(j.position||""));
    let jobs=filtered.slice(0,3).map(j=>({title:j.position,company:j.company,location:j.location||"Remote",url:j.url,description:(j.description||"").slice(0,3000)}));
    let new_saved=0; let emails_sent=0; let brevo_last={}; let brevo_errors=[]; let sent_jobs=[];

    for(const job of jobs){
      const groqRes=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${GROQ_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:[{role:"system",content:"You are expert cover letter writer for Full Stack AI Developer. Return JSON with cover_letter (3 paras, MUST mention autonomous agent pitch: This email was sent by autonomous Full Stack AI agent I built - scrapes RemoteOK, Groq LLM tailoring, Supabase, Brevo API, Vercel Cron, proves Full Stack AI skills, 200 words, single Dear), tailored_resume, match_score 9-10."},{role:"user",content:`Job=${job.title} at ${job.company} Desc=${job.description} Candidate=Ron Kahn`}],response_format:{type:"json_object"}})});
      const gj=await groqRes.json();
      let ai={}; try{ai=JSON.parse(gj.choices?.[0]?.message?.content||"{}")}catch{}
      if(!ai.cover_letter||ai.cover_letter.length<80){
        ai.cover_letter=`I am excited to apply for ${job.title} at ${job.company}. As a Full Stack AI Developer specializing in Python, Angular, Go, Next.js, Node.js, I build scalable AI-powered systems.\n\nI built an autonomous job application agent — the system contacting you right now. It scrapes Full Stack AI roles (RemoteOK API), tailors resumes with Groq LLM, stores in Supabase, sends via Brevo API, deployed on Vercel with cron. This end-to-end project proves my Full Stack AI + automation expertise in production.\n\nResume: ${RESUME_LINK}. Live demo: https://job-agents-real.vercel.app. Thank you.`;
      }
      ai.cover_letter=cleanCoverLetter(ai.cover_letter);
      await supabase.from('jobs').insert({title:job.title,company:job.company,location:job.location,url:job.url,description:job.description,tailored_resume:ai.tailored_resume||"Full Stack AI Developer",cover_letter:ai.cover_letter,match_score:9,created_at:new Date().toISOString()});
      new_saved++;
      const html=`<div style="font-family:Arial,sans-serif;line-height:1.7;max-width:650px;padding:20px;border:1px solid #eee;border-radius:10px;">
        <p>Dear ${job.company} Hiring Team,</p>
        <p>${ai.cover_letter.replace(/\n\n/g,"</p><p>")}</p>
        <div style="margin:22px 0;padding:16px;background:#eef7ff;border-left:4px solid #0070f3;border-radius:6px;">
          <b>🚀 Proof of Work - Autonomous AI Agent I Built:</b><br>
          This email was autonomously sent by my Full Stack AI agent: RemoteOK API → Groq LLM → Supabase → Brevo API → Vercel Cron. Live: job-agents-real.vercel.app<br>
          This demonstrates Full Stack + AI + Automation in production.
        </div>
        <p><b>Role:</b> ${job.title}<br><b>Link:</b> <a href="${job.url}">${job.url}</a></p>
        <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-radius:8px;">
          <a href="${RESUME_LINK}" style="background:#000;color:#fff;padding:10px 18px;text-decoration:none;border-radius:5px;">View Resume</a> ${RESUME_LINK}
        </div>
        <p>Best,<br><b>Ron Kahn</b><br>Full Stack AI Developer<br>Live Agent: https://job-agents-real.vercel.app</p>
      </div>`;
      const brevoRes=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":BREVO_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({sender:{name:"Ron Kahn - Full Stack AI Dev",email:SENDER_EMAIL},to:[{email:BCC_EMAIL}],subject:`Full Stack AI Dev - ${job.title} at ${job.company} | Autonomous Agent Demo`,htmlContent:html})});
      const bj=await brevoRes.json(); brevo_last=bj;
      if(brevoRes.ok){emails_sent++; sent_jobs.push(job.title);} else {brevo_errors.push(JSON.stringify(bj).slice(0,300));}
    }
    return new Response(JSON.stringify({ok:true,filter:"Full Stack AI ONLY + Autonomous Pitch",scraped:jobs.length,new_saved,emails_sent,sent_jobs,brevo_last,brevo_errors,using_env:true,env_len:BREVO_API_KEY.length,RESUME_LINK,time:new Date().toISOString()}),{headers:{"Content-Type":"application/json"}});
  }catch(err){return new Response(JSON.stringify({ok:false,error:err.message}),{status:500});}
}
