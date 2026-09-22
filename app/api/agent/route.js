export const dynamic='force-dynamic';
export const runtime='nodejs';
const GROQ_API_KEY="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";
const SUPABASE_URL="https://ekubsfgyuqziizfjmcs-k.supabase.co";
const SUPABASE_KEY="sb_publishable_kHr0-nudVWjliHw_owPm7A_G1NA4i8o";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL="ron@venushq7.com";
const BCC_EMAIL="venusailux@gmail.com";
const RESUME_LINK="https://job-agents-real.vercel.app/resume.pdf";
const DEFAULT_RESUME="Ron Kahn | Full Stack AI Developer | Next.js, Node.js, Python, Angular, Go, LangChain, RAG, Supabase, Vercel";

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
    if(!BREVO_API_KEY){
      return new Response(JSON.stringify({ok:false,error:"Add BREVO_API_KEY in Vercel ENV: vercel.com -> project -> Settings -> Environment Variables -> BREVO_API_KEY -> Redeploy"}),{status:500});
    }
    const {createClient}=await import('@supabase/supabase-js');
    const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
    const r=await fetch("https://remoteok.com/api",{headers:{"User-Agent":"Mozilla/5.0"}});
    const all=await r.json();
    let filtered=all.slice(1).filter(isFullStackAI);
    if(filtered.length===0) filtered=all.slice(1).filter(j=>/full stack/i.test(j.position||""));
    let jobs=filtered.slice(0,5).map(j=>({title:j.position,company:j.company,location:j.location||"Remote",url:j.url,description:(j.description||"").slice(0,3000)}));
    let new_saved=0; let emails_sent=0; let brevo_last={}; let brevo_errors=[]; let sent_jobs=[];
    for(const job of jobs){
      const groqRes=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${GROQ_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:[{role:"system",content:"You are expert cover letter writer for Full Stack AI Developer. Return JSON with cover_letter (3 paragraphs, MUST include autonomous agent pitch: I built autonomous job system that is contacting you right now - scrapes RemoteOK, tailors with Groq LLM, stores Supabase, sends via Brevo API, deployed Vercel Cron, proves Full Stack AI skills, no duplicate Dear, 200 words), tailored_resume, match_score 9-10."},{role:"user",content:`Job=${job.title} at ${job.company} Desc=${job.description} Candidate=Ron Kahn Full Stack AI Developer Python Angular Go - mention autonomous system`}],response_format:{type:"json_object"}})});
      const gj=await groqRes.json();
      let ai={}; try{ai=JSON.parse(gj.choices?.[0]?.message?.content||"{}")}catch{}
      if(!ai.cover_letter||ai.cover_letter.length<80){
        ai.cover_letter=`I am excited to apply for the ${job.title} at ${job.company}. As a Full Stack AI Developer with 5+ years in Python, Angular, Go, Next.js, Node.js, I build scalable microservices and LLM-powered apps.\n\nTo demonstrate my Full Stack AI expertise, I built an autonomous job application agent — the very system sending you this email right now. It scrapes Full Stack AI roles from RemoteOK API, uses Groq LLM (Llama 3) to generate tailored resumes and cover letters, stores data in Supabase, sends transactional emails via Brevo API, and is deployed on Vercel with cron jobs. This end-to-end automation proves my ability to build production-grade AI-powered full-stack systems.\n\nI would love to bring this same innovation to ${job.company}. Resume: ${RESUME_LINK}. Live demo: https://job-agents-real.vercel.app. Thank you for consideration.`;
      }
      ai.cover_letter=cleanCoverLetter(ai.cover_letter);
      if(!ai.tailored_resume) ai.tailored_resume=DEFAULT_RESUME;
      await supabase.from('jobs').insert({title:job.title,company:job.company,location:job.location,url:job.url,description:job.description,tailored_resume:ai.tailored_resume,cover_letter:ai.cover_letter,match_score:ai.match_score||9,created_at:new Date().toISOString()});
      new_saved++;
      const html=`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:650px;padding:20px;border:1px solid #eee;border-radius:10px;">
        <p>Dear ${job.company} Hiring Team,</p>
        <p>${ai.cover_letter.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}</p>
        <div style="margin:22px 0;padding:16px;background:#eef7ff;border-left:4px solid #0070f3;border-radius:6px;">
          <b>🚀 Proof of Work - Autonomous AI Agent I Built:</b><br>
          This email itself was autonomously sent by my Full Stack AI agent that I architected and built: Scrapes Full Stack AI jobs (RemoteOK API) → Tailors resume & cover letter with Groq LLM (Llama 3) → Saves to Supabase → Sends via Brevo API → Deployed on Vercel with Cron. This demonstrates my Full Stack + AI + Automation skills in production.<br>
          Live Agent: <a href="https://job-agents-real.vercel.app">job-agents-real.vercel.app</a> | Code shows Python, Angular, Go, Next.js, Supabase, Brevo, Vercel integration.
        </div>
        <p><b>Role:</b> ${job.title} at ${job.company}<br><b>Job:</b> <a href="${job.url}">${job.url}</a></p>
        <div style="margin:25px 0;padding:18px;background:#f5f5f5;border-radius:8px;">
          <p><b>📄 Resume:</b></p>
          <a href="${RESUME_LINK}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:bold;">View / Download Resume</a>
          <p style="word-break:break-all;font-size:13px;">${RESUME_LINK}</p>
          <p><b>Tailored Summary:</b><br>${ai.tailored_resume}</p>
        </div>
        <p>Best regards,<br><b>Ron Kahn</b><br>Full Stack AI Developer | Python • Angular • Go • Next.js • LLM/RAG<br>ron@venushq7.com | ${RESUME_LINK}<br>Live Autonomous Agent: https://job-agents-real.vercel.app</p>
      </div>`;
      const brevoRes=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":BREVO_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({sender:{name:"Ron Kahn - Full Stack AI Developer",email:SENDER_EMAIL},to:[{email:BCC_EMAIL}],subject:`Full Stack AI Developer - ${job.title} at ${job.company} | Autonomous AI Agent Demo by Ron Kahn`,htmlContent:html})});
      const brevoJson=await brevoRes.json(); brevo_last=brevoJson;
      if(brevoRes.ok){emails_sent++; sent_jobs.push(job.title);} else {brevo_errors.push(JSON.stringify(brevoJson).slice(0,250));}
    }
    return new Response(JSON.stringify({ok:true,filter:"Full Stack AI ONLY + Autonomous Pitch Included",scraped:jobs.length,new_saved,emails_sent,sent_jobs,brevo_last,brevo_errors,RESUME_LINK,using_env:!!BREVO_API_KEY,time:new Date().toISOString()}),{headers:{"Content-Type":"application/json"}});
  }catch(err){return new Response(JSON.stringify({ok:false,error:err.message}),{status:500});}
}
