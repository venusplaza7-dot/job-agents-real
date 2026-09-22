export const dynamic='force-dynamic';
export const runtime='nodejs';
const GROQ_API_KEY="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";
const SUPABASE_URL="https://ekubsfgyuqziizfjmcs-k.supabase.co";
const SUPABASE_KEY="sb_publishable_kHr0-nudVWjliHw_owPm7A_G1NA4i8o";
const BREVO_API_KEY="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";
const SENDER_EMAIL="ron@venushq7.com";
const BCC_EMAIL="venusailux@gmail.com";
const RESUME_LINK="https://job-agents-real.vercel.app/resume.pdf";
const DEFAULT_RESUME="Ron Kahn | Full Stack AI Developer\n5+ years building AI-powered web apps, LLMs, RAG, Next.js, Node.js, Python, Supabase, Vercel. Built job automation agents, chatbots, AI search.";

function isFullStackAI(job){
 const t=(job.position||"").toLowerCase();
 const d=(job.description||"").toLowerCase();
 const combined=t+" "+d;
 const hasFullStack = t.includes("full stack") || t.includes("full-stack") || t.includes("fullstack");
 const hasAI = combined.includes(" ai ") || combined.includes("llm") || combined.includes("openai") || combined.includes("rag") || t.includes("ai") || d.includes("artificial intelligence");
 // Allow if title is Full Stack, or Full Stack AI, AI Engineer Full Stack, MERN + AI, etc
 if(hasFullStack) return true;
 if(t.includes("ai engineer") || t.includes("ai developer") || t.includes("full stack")) return true;
 return false;
}

export async function GET(){
 try{
  const {createClient}=await import('@supabase/supabase-js');
  const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
  const r=await fetch("https://remoteok.com/api",{headers:{"User-Agent":"Mozilla/5.0"}});
  const all=await r.json();
  let jobs=all.slice(1).filter(isFullStackAI).slice(0,7).map(j=>({title:j.position,company:j.company,location:j.location||"Remote",url:j.url,description:(j.description||"").slice(0,3000)}));
  // fallback if filter too strict
  if(jobs.length<3){
    jobs=all.slice(1).filter(j=>/full stack/i.test(j.position||"")).slice(0,7).map(j=>({title:j.position,company:j.company,location:j.location||"Remote",url:j.url,description:(j.description||"").slice(0,3000)}));
  }

  let new_saved=0; let emails_sent=0; let brevo_last={}; let brevo_errors=[]; let sent_jobs=[];
  for(const job of jobs){
    const groqRes=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${GROQ_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:[{role:"system",content:"You are an expert cover letter writer for Full Stack AI Developer roles. Always return valid JSON with 3 keys: tailored_resume (1 paragraph summary tailored to job), cover_letter (3 paragraphs professional cover letter mentioning company name and role, 150 words min), match_score (number 0-10). Never return empty fields. If job is not Full Stack AI, still write as Full Stack AI perspective."},{role:"user",content:`Job Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nDescription: ${job.description}\n\nCandidate: Ron Kahn, Full Stack AI Developer, Next.js, Node, Python, LangChain, Supabase, Vercel, GROQ, Brevo. Resume: ${DEFAULT_RESUME}`}],response_format:{type:"json_object"}})});
    const gj=await groqRes.json();
    let ai={}; try{ai=JSON.parse(gj.choices?.[0]?.message?.content||"{}")}catch{ ai={}; }
    if(!ai.cover_letter || ai.cover_letter.length<30){
      ai.cover_letter=`Dear ${job.company} Hiring Team,\n\nI am excited to apply for the ${job.title} role at ${job.company}. As a Full Stack AI Developer with 5+ years building AI-powered web applications using Next.js, Node.js, Python, LangChain, Supabase and Vercel, I have built autonomous job agents, RAG systems, and LLM integrations that deliver real business value.\n\nYour role for ${job.title} aligns perfectly with my experience in full-stack development and AI integration. I have shipped production AI features including tailored resume generation, automated email workflows with Brevo, and scalable job scraping pipelines.\n\nI would love to bring my full-stack AI expertise to ${job.company}. My resume is available at ${RESUME_LINK} and I am available for an interview at your convenience.\n\nBest regards,\nRon Kahn`;
    }
    if(!ai.tailored_resume) ai.tailored_resume=DEFAULT_RESUME;

    await supabase.from('jobs').insert({title:job.title,company:job.company,location:job.location,url:job.url,description:job.description,tailored_resume:ai.tailored_resume,cover_letter:ai.cover_letter,match_score:ai.match_score||8,created_at:new Date().toISOString()});
    new_saved++;

    const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:650px;">
      <p>Dear ${job.company} Hiring Team,</p>
      <p>${ai.cover_letter.replace(/\n/g,"<br><br>")}</p>
      <p><b>Role:</b> ${job.title} at ${job.company} - ${job.location}<br>
      <b>Match Score:</b> ${ai.match_score||8}/10<br>
      <b>Job Link:</b> <a href="${job.url}">${job.url}</a></p>
      <hr>
      <p><b>📄 My Resume (PDF):</b> <a href="${RESUME_LINK}" style="background:#000;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;">View / Download Resume</a> - ${RESUME_LINK}</p>
      <p><b>Tailored Summary:</b><br>${ai.tailored_resume}</p>
      <p>Best regards,<br><b>Ron Kahn</b><br>Full Stack AI Developer<br>ron@venushq7.com<br><a href="${RESUME_LINK}">${RESUME_LINK}</a></p>
    </div>`;

    const brevoRes=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":BREVO_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({sender:{name:"Ron Kahn - Full Stack AI Developer",email:SENDER_EMAIL},to:[{email:BCC_EMAIL}],subject:`Application: Full Stack AI Developer - ${job.title} at ${job.company}`,htmlContent:html})});
    const brevoJson=await brevoRes.json(); brevo_last=brevoJson;
    if(brevoRes.ok){emails_sent++; sent_jobs.push(job.title);} else {brevo_errors.push(JSON.stringify(brevoJson).slice(0,300));}
  }
  return new Response(JSON.stringify({ok:true,filter:"Full Stack AI Developer ONLY",scraped:jobs.length,new_saved,emails_sent,sent_jobs,brevo_last,brevo_errors,time:new Date().toISOString()}),{headers:{"Content-Type":"application/json"}});
 } catch(err){return new Response(JSON.stringify({ok:false,error:err.message}),{status:500})}
}
