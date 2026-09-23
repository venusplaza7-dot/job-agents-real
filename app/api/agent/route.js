export const dynamic='force-dynamic';
export const runtime='nodejs';
// CACHE BUSTER 2026-09-23-v5-Hl43k
const GROQ_API_KEY="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";
const SUPABASE_URL="https://ekubsfgyuqziizfjmcs-k.supabase.co";
const SUPABASE_KEY="sb_publishable_kHr0-nudVWjliHw_owPm7A_G1NA4i8o";
const BREVO_API_KEY = (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim().length>20 ? process.env.BREVO_API_KEY.trim() : "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");
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
    const {createClient}=await import('@supabase/supabase-js');
    const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
    const r=await fetch("https://remoteok.com/api",{headers:{"User-Agent":"Mozilla/5.0"}});
    const all=await r.json();
    let filtered=all.slice(1).filter(isFullStackAI);
    if(filtered.length===0) filtered=all.slice(1).filter(j=>/full stack/i.test(j.position||""));
    let jobs=filtered.slice(0,3).map(j=>({title:j.position,company:j.company,location:j.location||"Remote",url:j.url,description:(j.description||"").slice(0,3000)}));
    let new_saved=0; let emails_sent=0; let brevo_last={}; let brevo_errors=[]; let sent_jobs=[];

    for(const job of jobs){
      const groqRes=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${GROQ_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:[{role:"system",content:"You are expert cover letter writer for Full Stack AI Developer. Return JSON with cover_letter (MUST include paragraph: I built an autonomous job application agent - this email was autonomously sent by my Full Stack AI system that scrapes RemoteOK Full Stack AI roles, tailors with Groq LLM, stores Supabase, sends via Brevo API, deployed Vercel Cron - proves Full Stack AI automation in production. Single Dear only, 250 words), tailored_resume, match_score 9."},{role:"user",content:`Job=${job.title} at ${job.company} Desc=${job.description} Candidate=Ron Kahn Full Stack AI Developer Python Angular Go Next.js Node.js LLM RAG`}],response_format:{type:"json_object"}})});
      const gj=await groqRes.json();
      let ai={}; try{ai=JSON.parse(gj.choices?.[0]?.message?.content||"{}")}catch{}
      if(!ai.cover_letter||ai.cover_letter.length<80){
        ai.cover_letter=`Dear ${job.company} Hiring Team,\n\nI am excited to apply for the ${job.title} role. As a Full Stack AI Developer with 5+ years building scalable web apps and LLM systems using Python, Angular, Go, Next.js, Node.js, I deliver end-to-end AI products.\n\nTo demonstrate my skills, I built an autonomous job application agent — the system contacting you right now. It scrapes Full Stack AI Developer roles via RemoteOK API, uses Groq LLM to tailor resumes and cover letters, stores in Supabase, sends via Brevo API, and runs autonomously on Vercel with cron. This live production system proves my Full Stack AI + automation expertise.\n\nResume: ${RESUME_LINK} | Live Agent: https://job-agents-real.vercel.app. I would love to bring this innovation to ${job.company}.\n\nBest,\nRon Kahn`;
      }
      ai.cover_letter=cleanCoverLetter(ai.cover_letter);
      await supabase.from('jobs').insert({title:job.title,company:job.company,location:job.location,url:job.url,description:job.description,tailored_resume:ai.tailored_resume||"Ron Kahn Full Stack AI Developer",cover_letter:ai.cover_letter,match_score:9,created_at:new Date().toISOString()});
      new_saved++;
      const html=`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:650px;padding:20px;border:1px solid #eee;border-radius:10px;">
        <p>${ai.cover_letter.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}</p>
        <div style="margin:22px 0;padding:16px;background:#eef7ff;border-left:4px solid #0070f3;border-radius:6px;">
          <b>🚀 Proof of Work - Autonomous AI Agent I Built (Full Stack AI):</b><br>
          This email was autonomously sent by my Full Stack AI agent I architected. Flow: RemoteOK API → Filter Full Stack AI ONLY → Groq LLM (gpt-oss-20b) tailoring → Supabase → Brevo API → Vercel Cron (autonomous). Live demo: <a href="https://job-agents-real.vercel.app">job-agents-real.vercel.app</a> — This itself is the portfolio.
        </div>
        <p><b>Role:</b> ${job.title} at ${job.company}<br><b>Job Link:</b> <a href="${job.url}">${job.url}</a></p>
        <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-radius:8px;">
          <p><b>📄 Resume:</b> <a href="${RESUME_LINK}" style="display:inline-block;background:#000;color:#fff;padding:10px 18px;text-decoration:none;border-radius:5px;">View / Download Resume</a></p>
          <p style="word-break:break-all;font-size:12px;">${RESUME_LINK}</p>
          <p><b>Tailored:</b> ${ai.tailored_resume||"Full Stack AI Developer - Python, Angular, Go, Next.js, LLM"}</p>
        </div>
        <p>Best regards,<br><b>Ron Kahn</b><br>Full Stack AI Developer | ron@venushq7.com<br>Live Autonomous Agent: https://job-agents-real.vercel.app</p>
      </div>`;
      const brevoRes=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":BREVO_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({sender:{name:"Ron Kahn - Full Stack AI Dev - Autonomous Agent",email:SENDER_EMAIL},to:[{email:BCC_EMAIL}],subject:`Full Stack AI Developer - ${job.title} at ${job.company} | Autonomous Agent Demo by Ron Kahn`,htmlContent:html})});
      const bj=await brevoRes.json(); brevo_last=bj;
      if(brevoRes.ok){emails_sent++; sent_jobs.push(job.title);} else {brevo_errors.push(JSON.stringify(bj).slice(0,250));}
    }
    return new Response(JSON.stringify({ok:true,filter:"Full Stack AI ONLY + Autonomous Pitch Included",scraped:jobs.length,new_saved,emails_sent,sent_jobs,brevo_last,brevo_errors,using_env:!!process.env.BREVO_API_KEY,env_len:BREVO_API_KEY.length,RESUME_LINK,time:new Date().toISOString()}),{headers:{"Content-Type":"application/json"}});
  }catch(err){return new Response(JSON.stringify({ok:false,error:err.message}),{status:500});}
}
