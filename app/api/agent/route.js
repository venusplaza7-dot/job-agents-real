export const dynamic='force-dynamic';
export const runtime='nodejs';

const GROQ_API_KEY="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";
const SUPABASE_URL="https://ekubsfgyuqziizfjmcs-k.supabase.co";
const SUPABASE_KEY="sb_publishable_kHr0-nudVWjliHw_owPm7A_G1NA4i8o";
const BREVO_KEY="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 89 bytes";
const SENDER_EMAIL="ron@venushq7.com";
const BCC_EMAIL="venusailux@gmail.com";
const RESUME_LINK="https://job-agents-real.vercel.app/resume.pdf";
const DEFAULT_RESUME="Ron Kahn | Full Stack AI Developer | Next.js, Node.js, Python, Angular, Go, LangChain, RAG, Supabase, Vercel, Groq, Brevo";

function isFullStackAI(job){
  const t=(job.position||"").toLowerCase();
  return t.includes("full stack") || t.includes("full-stack") || t.includes("fullstack") || t.includes("full stack ai") || t.includes("ai engineer") || t.includes("ai developer");
}

function cleanCoverLetter(text){
  if(!text) return "";
  let lines=text.split("\n").filter(l=>l.trim().length>0);
  let seenDear=false;
  let cleaned=[];
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
    let jobs=filtered.slice(0,5).map(j=>({
      title:j.position,
      company:j.company,
      location:j.location||"Remote",
      url:j.url,
      description:(j.description||"").slice(0,3000)
    }));

    let new_saved=0; let emails_sent=0; let brevo_last={}; let brevo_errors=[]; let sent_jobs=[];

    for(const job of jobs){
      const groqRes=await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",
        headers:{"Authorization":`Bearer ${GROQ_API_KEY}`,"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"openai/gpt-oss-20b",
          messages:[
            {role:"system",content:"You are an expert cover letter writer for Full Stack AI Developer. Return valid JSON with 3 keys: cover_letter (3 paragraphs, 200 words min, start with single Dear Hiring Manager, mention Python Angular Go Next.js Node.js Supabase, mention you built autonomous job agent that scrapes jobs, tailors with Groq LLM, stores in Supabase, sends via Brevo, deployed on Vercel - and this email itself is sent by that system, no duplicate Dear, professional), tailored_resume (1 paragraph tailored summary), match_score (9-10). Never empty."},
            {role:"user",content:`Write cover letter for Job Title=${job.title} Company=${job.company} Location=${job.location} Description=${job.description} Candidate=Ron Kahn Full Stack AI Developer built autonomous system that contacts HR. Include autonomous agent pitch.`}
          ],
          response_format:{type:"json_object"}
        })
      });

      const gj=await groqRes.json();
      let ai={}; try{ ai=JSON.parse(gj.choices?.[0]?.message?.content||"{}"); }catch{}
      
      if(!ai.cover_letter || ai.cover_letter.length<80){
        ai.cover_letter=`I am excited to apply for the ${job.title} position at ${job.company}. As a Full Stack AI Developer with 5+ years building AI-powered web applications using Python, Angular, Go, Next.js, and Node.js, I specialize in scalable microservices, REST APIs, and LLM integrations including RAG and autonomous agents.\n\nTo demonstrate my Full Stack AI capabilities, I recently built an autonomous job application system — the same system contacting you right now. It scrapes Full Stack AI roles from RemoteOK, uses Groq LLM (Llama 3) to generate tailored resumes and cover letters, stores data in Supabase, sends transactional emails via Brevo API, and runs on Vercel with cron automation. This end-to-end project showcases my expertise in full-stack development, AI/LLM integration, and automation.\n\nI am eager to bring this same innovation and execution to ${job.company}'s remote team. Thank you for considering my application. My resume is available at ${RESUME_LINK} and you can view the live agent code at https://job-agents-real.vercel.app.`;
      }

      ai.cover_letter=cleanCoverLetter(ai.cover_letter);
      if(!ai.tailored_resume) ai.tailored_resume=DEFAULT_RESUME;

      await supabase.from('jobs').insert({
        title:job.title,
        company:job.company,
        location:job.location,
        url:job.url,
        description:job.description,
        tailored_resume:ai.tailored_resume,
        cover_letter:ai.cover_letter,
        match_score:ai.match_score||9,
        created_at:new Date().toISOString()
      });
      new_saved++;

      const html=`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:650px;padding:20px;border:1px solid #eee;border-radius:10px;">
        <p>Dear ${job.company} Hiring Team,</p>
        <p>${ai.cover_letter.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}</p>
        
        <div style="margin:22px 0;padding:16px;background:#eef7ff;border-left:4px solid #0070f3;border-radius:6px;">
          <b>🚀 Proof of Work - Autonomous AI Agent I Built:</b><br>
          This email itself was sent by my autonomous Full Stack AI agent: Scrapes jobs (RemoteOK API) → Tailors resume & cover letter with Groq LLM → Saves to Supabase → Sends via Brevo API → Deployed on Vercel with Cron. Live demo: <a href="https://job-agents-real.vercel.app">job-agents-real.vercel.app</a>
        </div>

        <p style="margin-top:20px;"><b>Role:</b> ${job.title} at ${job.company}<br>
        <b>Location:</b> ${job.location}<br>
        <b>Match:</b> ${ai.match_score||9}/10<br>
        <b>Job Link:</b> <a href="${job.url}">${job.url}</a></p>

        <div style="margin:25px 0;padding:18px;background:#f5f5f5;border-radius:8px;">
          <p style="margin:0 0 10px 0;"><b>📄 My Resume (PDF):</b></p>
          <a href="${RESUME_LINK}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:bold;">View / Download Resume</a>
          <p style="word-break:break-all;font-size:13px;margin-top:10px;">${RESUME_LINK}</p>
          <p style="margin-top:12px;"><b>Tailored Summary:</b><br>${ai.tailored_resume}</p>
        </div>

        <p>Best regards,<br><b>Ron Kahn</b><br>Full Stack AI Developer | Python • Angular • Go • Next.js<br>ron@venushq7.com<br><a href="${RESUME_LINK}">${RESUME_LINK}</a> | <a href="https://job-agents-real.vercel.app">Agent Live</a></p>
      </div>`;

      const brevoRes=await fetch("https://api.brevo.com/v3/smtp/email",{
        method:"POST",
        headers:{"api-key":BREVO_API_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({
          sender:{name:"Ron Kahn - Full Stack AI Developer",email:SENDER_EMAIL},
          to:[{email:BCC_EMAIL}],
          subject:`Full Stack AI Developer - ${job.title} at ${job.company} | Built Autonomous Agent Contacting You`,
          htmlContent:html
        })
      });

      const brevoJson=await brevoRes.json();
      brevo_last=brevoJson;
      if(brevoRes.ok){ emails_sent++; sent_jobs.push(job.title); }
      else{ brevo_errors.push(JSON.stringify(brevoJson).slice(0,300)); }
    }

    return new Response(JSON.stringify({
      ok:true,
      filter:"Full Stack AI Developer ONLY + Autonomous Agent Pitch",
      scraped:jobs.length,
      new_saved,
      emails_sent,
      sent_jobs,
      brevo_last,
      brevo_errors,
      RESUME_LINK,
      time:new Date().toISOString()
    }),{headers:{"Content-Type":"application/json"}});

  }catch(err){
    return new Response(JSON.stringify({ok:false,error:err.message}),{status:500});
  }
}
