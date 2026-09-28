/* HOURLY: 10 BEST AI ENGINEER JOBS -> REAL COMPANY
   VERSION: WORLD ROTATION 10 COUNTRIES/HOUR + GLOBAL FOREVER DEDUP + HUMAN DEMO + 6 SOURCES
   Sources: 1.RemoteOK 2.Arbeitnow 3.Remotive 4.Arbeitnow Startup 5.Wellfound 6.YC Work at a Startup
   Email hunting: 6 pages + Hunter.io API
*/

export const dynamic = 'force-dynamic';

async function getCompanyDomain(company){
  const clean = company.toLowerCase().replace(/[^a-z0-9]/g,'');
  const guesses = [
    `https://${clean}.com`,
    `https://${clean}.io`,
    `https://${clean}.ai`,
    `https://www.${clean}.com`,
  ];
  for(const url of guesses){
    try{
      const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}, signal: AbortSignal.timeout(3000)});
      if(r.ok || r.status===301 || r.status===302) return new URL(url).hostname;
    }catch{}
  }
  return `${clean}.com`;
}

async function findHREmailFromWebsite(company){
  const domain = await getCompanyDomain(company);
  const pages = [
    `https://${domain}`,
    `https://${domain}/careers`,
    `https://${domain}/jobs`,
    `https://${domain}/contact`,
    `https://${domain}/about`,
    `https://${domain}/hiring`,
  ];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  for(const page of pages){
    try{
      const r=await fetch(page,{headers:{'User-Agent':'Mozilla/5.0'}, signal: AbortSignal.timeout(5000)});
      if(!r.ok) continue;
      const html=await r.text();
      const emails=(html.match(emailRegex)||[]).filter(e=> !e.toLowerCase().includes('.png') && !e.toLowerCase().includes('.jpg') && !e.toLowerCase().includes('.svg'));
      const hr=emails.find(e=> /hr@|hiring@|jobs@|careers@|talent@|recruiting@/i.test(e));
      if(hr) return {email:hr, domain, sourcePage:page, guessed:false};
      if(emails.length>0){
        const sameDomain = emails.find(e=> e.toLowerCase().endsWith(`@${domain}`) || e.toLowerCase().includes(domain));
        if(sameDomain) return {email:sameDomain, domain, sourcePage:page, guessed:false};
      }
    }catch{}
  }
  return {email:`careers@${domain}`, domain, sourcePage:null, guessed:true};
}

// WORLD - 30 countries for 10 emails/hour = worldwide
const WORLD_COUNTRIES = [
  {code:'sg', name:'Singapore', query:'singapore', flag:'🇸🇬'},
  {code:'sa', name:'Saudi Arabia', query:'saudi arabia', flag:'🇸🇦'},
  {code:'ae', name:'UAE Dubai', query:'dubai', flag:'🇦🇪'},
  {code:'qa', name:'Qatar', query:'qatar', flag:'🇶🇦'},
  {code:'us-startup', name:'US Startup', query:'san francisco startup', flag:'🚀'},
  {code:'ca', name:'Canada', query:'canada', flag:'🇨🇦'},
  {code:'in', name:'India', query:'india', flag:'🇮🇳'},
  {code:'pk', name:'Pakistan', query:'pakistan', flag:'🇵🇰'},
  {code:'id', name:'Indonesia', query:'indonesia', flag:'🇮🇩'},
  {code:'jp', name:'Japan', query:'japan', flag:'🇯🇵'},
  {code:'kr', name:'South Korea', query:'south korea', flag:'🇰🇷'},
  {code:'ph', name:'Philippines', query:'philippines', flag:'🇵🇭'},
  {code:'br', name:'Brazil', query:'brazil', flag:'🇧🇷'},
  {code:'mx', name:'Mexico', query:'mexico', flag:'🇲🇽'},
  {code:'ar', name:'Argentina', query:'argentina', flag:'🇦🇷'},
  {code:'co', name:'Colombia', query:'colombia', flag:'🇨🇴'},
  {code:'gb', name:'UK', query:'uk', flag:'🇬🇧'},
  {code:'de', name:'Germany', query:'germany', flag:'🇩🇪'},
  {code:'nl', name:'Netherlands', query:'netherlands', flag:'🇳🇱'},
  {code:'se', name:'Sweden', query:'sweden', flag:'🇸🇪'},
  {code:'fr', name:'France', query:'france', flag:'🇫🇷'},
  {code:'es', name:'Spain', query:'spain', flag:'🇪🇸'},
  {code:'pl', name:'Poland', query:'poland', flag:'🇵🇱'},
  {code:'tr', name:'Turkey', query:'turkey', flag:'🇹🇷'},
  {code:'il', name:'Israel', query:'israel', flag:'🇮🇱'},
  {code:'ng', name:'Nigeria', query:'nigeria', flag:'🇳🇬'},
  {code:'ke', name:'Kenya', query:'kenya', flag:'🇰🇪'},
  {code:'za', name:'South Africa', query:'south africa', flag:'🇿🇦'},
  {code:'eg', name:'Egypt', query:'egypt', flag:'🇪🇬'},
  {code:'au', name:'Australia', query:'australia', flag:'🇦🇺'},
  {code:'remote', name:'Remote Startup', query:'remote startup', flag:'🌍'},
];

function getWorldBatchForThisHour(){
  const hour = new Date().getHours();
  const start = (hour * 7) % WORLD_COUNTRIES.length;
  const batch=[];
  for(let i=0;i<10;i++){
    batch.push(WORLD_COUNTRIES[(start+i) % WORLD_COUNTRIES.length]);
  }
  return batch;
}

async function fetchAllAIJobsWorld(batch){
  let all=[];
  const UA={'User-Agent':'Mozilla/5.0'};
  
  for(const country of batch){
    const q = country.query;
    // 1. RemoteOK
    try{
      const r=await fetch(`https://remoteok.com/api?t=${q}`, {headers:UA, signal: AbortSignal.timeout(5000)});
      const j=await r.json();
      all.push(...j.slice(1).map(x=>({position:x.position, company:x.company, desc:x.description, url:`https://remoteok.com${x.url}`, id:`rok-${country.code}-${x.id}`, country:country.code, countryName:country.name, countryFlag:country.flag, query:q})));
    }catch{}
    // 2. Arbeitnow - country + ai engineer
    try{
      const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(q)}+ai+engineer`, {headers:UA, signal: AbortSignal.timeout(5000)});
      const j=await r.json();
      const data=j.data||[];
      all.push(...data.map(x=>({position:x.title, company:x.company_name, desc:x.description, url:x.url, id:`arb-${country.code}-${x.slug}`, country:country.code, countryName:country.name, countryFlag:country.flag, query:q})));
    }catch{}
    // 3. Remotive
    try{
      const r=await fetch(`https://remotive.com/api/remote-jobs?category=software-dev&search=${encodeURIComponent(q)}`, {headers:UA, signal: AbortSignal.timeout(5000)});
      const j=await r.json();
      all.push(...(j.jobs||[]).map(x=>({position:x.title, company:x.company_name, desc:x.description, url:x.url, id:`rem-${country.code}-${x.id}`, country:country.code, countryName:country.name, countryFlag:country.flag, query:q})));
    }catch{}
    // 4. Arbeitnow Startup - generic startup
    try{
      const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=ai+engineer+startup+${encodeURIComponent(q)}`, {headers:UA, signal: AbortSignal.timeout(5000)});
      const j=await r.json();
      const data=j.data||[];
      all.push(...data.map(x=>({position:x.title, company:x.company_name, desc:x.description, url:x.url, id:`arb-startup-${country.code}-${x.slug}`, country:country.code, countryName:country.name, countryFlag:country.flag, query:q})));
    }catch{}
    // 5. WELLFOUND - Source 5 NEW
    try{
      const r=await fetch(`https://wellfound.com/api/search?q=${encodeURIComponent(q+' ai engineer')}&type=job`, {headers:{...UA, 'Accept':'application/json'}, signal: AbortSignal.timeout(5000)});
      const j=await r.json();
      const jobs=j.jobs||j.results||[];
      all.push(...jobs.slice(0,10).map((x,i)=>({
        position: x.title||x.role||'AI Engineer',
        company: x.company_name||x.company||x.startup?.name||'Wellfound Startup',
        desc: x.description||x.role_description||'AI Engineer startup role',
        url: x.url||`https://wellfound.com/company/${x.company_name}`,
        id:`wellfound-${country.code}-${i}-${Date.now()}`,
        country:country.code,
        countryName:country.name,
        countryFlag:country.flag,
        query:q,
        source:'wellfound'
      })));
    }catch{
      // Fallback Wellfound via Arbeitnow style if API blocked
      try{
        const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=wellfound+${encodeURIComponent(q)}+ai`, {headers:UA, signal: AbortSignal.timeout(3000)});
        const j=await r.json();
        const data=j.data||[];
        if(data.length>0) all.push(...data.slice(0,2).map(x=>({position:x.title, company:x.company_name, desc:x.description, url:x.url, id:`wellfound-fb-${country.code}-${x.slug}`, country:country.code, countryName:country.name, countryFlag:country.flag, query:q, source:'wellfound-fallback'})));
      }catch{}
    }
    // 6. YC WORK AT A STARTUP - Source 6 NEW
    try{
      const r=await fetch(`https://workatastartup.com/jobs?query=${encodeURIComponent(q+' AI engineer')}`, {headers:{...UA, 'Accept':'text/html'}, signal: AbortSignal.timeout(5000)});
      const html=await r.text();
      // Parse YC jobs from HTML if API not json - extract titles
      const matches = [...html.matchAll(/class="job-name[^"]*">([^<]+)</g)].slice(0,5);
      for(let i=0;i<matches.length;i++){
        const title=matches[i][1].trim();
        if(title.toLowerCase().includes('ai') || title.toLowerCase().includes('engineer')){
          all.push({
            position: title,
            company: `YC Startup ${country.code}`,
            desc: `YC startup in ${country.name} hiring ${title}`,
            url: `https://workatastartup.com/jobs?query=${encodeURIComponent(q)}`,
            id:`yc-${country.code}-${i}-${Date.now()}`,
            country:country.code,
            countryName:country.name,
            countryFlag:country.flag,
            query:q,
            source:'yc'
          });
        }
      }
    }catch{
      // Fallback YC via RemoteOK style if blocked
      try{
        const r=await fetch(`https://remoteok.com/api?t=yc+${encodeURIComponent(q)}`, {headers:UA, signal: AbortSignal.timeout(3000)});
        const j=await r.json();
        const arr=j.slice(1,3);
        if(arr.length>0) all.push(...arr.map(x=>({position:x.position, company:x.company, desc:x.description, url:`https://remoteok.com${x.url}`, id:`yc-fb-${country.code}-${x.id}`, country:country.code, countryName:country.name, countryFlag:country.flag, query:q, source:'yc-fallback'})));
      }catch{}
    }
  }
  return all;
}

function isAIDev(j){
  const t=(j.position||'').toLowerCase();
  const hasEngineer = t.includes('engineer') || t.includes('developer');
  const hasAI = t.includes('ai engineer') || t.includes('ai developer') || t.includes('llm engineer') || t.includes('rag engineer') || t.includes('genai engineer') || t.includes('ml engineer') || t.includes('machine learning engineer') || t.includes('generative ai engineer') || t.includes('generative ai');
  const blocked = t.includes('product manager') || t.includes('chief of staff') || t.includes('analyst') || t.includes('marketing') || t.includes('recruiter') || t.includes('sales') || t.includes('designer') || t.includes('writer') || t.includes('product owner') || t.includes('scrum master');
  return hasEngineer && hasAI && !blocked;
}

function tailor(job){
  const d=(job.desc||'').toLowerCase();
  const skills=[];
  if(d.includes('python')) skills.push('Python');
  if(d.includes('next')) skills.push('Next.js');
  if(d.includes('react')) skills.push('React');
  if(d.includes('rag')) skills.push('RAG');
  if(d.includes('llm')||d.includes('langchain')) skills.push('LLM/LangChain');
  if(d.includes('supabase')) skills.push('Supabase');
  if(d.includes('agent')) skills.push('Autonomous Agents');
  if(d.includes('vector')||d.includes('pinecone')||d.includes('weaviate')) skills.push('Vector DB');
  if(d.includes('pytorch')||d.includes('hugging face')||d.includes('provenance')||d.includes('verification')) skills.push('Model Verification');
  if(skills.length===0) skills.push('AI Automation');
  return skills;
}

export async function GET(req){
  const force=new URL(req.url).searchParams.get('force')==='true';
  const BREVO=(process.env.BREVO_API_KEY||'');
  const SUPA_URL=(process.env.SUPABASE_URL||'');
  const SUPA_KEY=(process.env.SUPABASE_ANON_KEY||'');
  const SENDER='ron@venushq7.com';
  const SENDER_NAME='Ron Kahn';
  const BCC=['venusailux@gmail.com','Venusplaza7@gmail.com'];
  const LINKEDIN_URL=process.env.LINKEDIN_URL||'https://www.linkedin.com/in/venus-plaza-81044525a';
  const GITHUB_URL=process.env.GITHUB_URL||'https://github.com/venusplaza7-dot';
  const HUNTER_KEY=process.env.HUNTER_API_KEY||'';

  const batch = getWorldBatchForThisHour();
  const dbg={mode:`WORLD ROTATION - 10 Countries this hour - 6 SOURCES (RemoteOK, Arbeitnow, Remotive, Startup, Wellfound, YC) + HUMAN DEMO`, total:0, ai_dev:0, unique:0, sent:0, details:[], skipped_forever:[], skipped_domain:[], bcc:BCC, sender:SENDER, hunter_enabled:!!HUNTER_KEY, countries:batch.map(c=> `${c.flag} ${c.name} (${c.code})`), world_batch:batch};

  let jobs=await fetchAllAIJobsWorld(batch); dbg.total=jobs.length;
  let filtered=jobs.filter(isAIDev);
  const uniq=new Map(); filtered.forEach(j=>{ if(!uniq.has(j.url)) uniq.set(j.url,j); });
  filtered=[...uniq.values()]; dbg.ai_dev=filtered.length;

  // --- GLOBAL FOREVER DEDUP - NEVER SEND TO SAME DOMAIN/EMAIL EVER ---
  let sentCompanies=new Set();
  let sentDomains=new Set();
  let sentEmails=new Set();
  let sentIds=new Set();
  try{
    const r1=await fetch(`${SUPA_URL}/rest/v1/sent_jobs?select=company,domain,hr_email`, {headers:{'apikey':SUPA_KEY, 'Authorization':`Bearer ${SUPA_KEY}`}});
    const allHistory=await r1.json();
    sentCompanies=new Set((allHistory||[]).map(x=> (x.company||'').toLowerCase().replace(/[^a-z0-9]/g,'')));
    sentDomains=new Set((allHistory||[]).map(x=> (x.domain||'').toLowerCase()));
    sentEmails=new Set((allHistory||[]).map(x=> (x.hr_email||'').toLowerCase()));
    const r2=await fetch(`${SUPA_URL}/rest/v1/sent_jobs?select=job_id`, {headers:{'apikey':SUPA_KEY, 'Authorization':`Bearer ${SUPA_KEY}`}});
    const allSent=await r2.json();
    sentIds=new Set((allSent||[]).map(x=> x.job_id));
  }catch(e){ console.log('Supabase dedup error', e.message); }

  filtered.sort((a,b)=>{
    const score = (j)=>{
      let s=0;
      const t=(j.position||'').toLowerCase();
      if(t.includes('ai engineer')) s+=10;
      if(t.includes('llm engineer')) s+=9;
      if(t.includes('rag engineer')) s+=9;
      if(t.includes('genai engineer')) s+=8;
      if(t.includes('ml engineer')) s+=7;
      if(j.source==='wellfound' || j.source==='yc') s+=6;
      if(j.country==='sg' || j.country==='sa' || j.country==='ae') s+=5;
      if(t.includes('remote')) s+=3;
      if(t.includes('startup')) s+=4;
      return s;
    };
    return score(b)-score(a);
  });

  // Ensure world diversity: take max 1-2 per country to get 10 countries
  const perCountry = new Map();
  let diversified=[];
  for(const j of filtered){
    const cnt=perCountry.get(j.country)||0;
    if(cnt<2){
      diversified.push(j);
      perCountry.set(j.country, cnt+1);
    }
    if(diversified.length>=30) break;
  }
  filtered=diversified;

  let toSend=filtered.filter(j=>{
    if(!force && sentIds.has(j.id)) return false;
    const cleanCompany=j.company.toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!force && sentCompanies.has(cleanCompany)){
      dbg.skipped_forever.push(`${j.company} - ${j.position} [${j.countryName}]`);
      return false;
    }
    return true;
  });

  if(toSend.length===0) return Response.json({ok:true, ...dbg, msg:'No new unique companies - GLOBAL FOREVER DEDUP is working'});
  
  // Pick 10 emails, each from different country if possible
  const picked=[];
  const usedCountries=new Set();
  for(const j of toSend){
    if(!usedCountries.has(j.country) || picked.length>=8){
      picked.push(j);
      usedCountries.add(j.country);
    }
    if(picked.length>=10) break;
  }
  toSend=picked.length>0?picked:toSend.slice(0,10);
  dbg.unique=toSend.length;
  dbg.countries_covered=[...new Set(toSend.map(j=> `${j.countryFlag} ${j.countryName}`))];

  for(const job of toSend){
    const skills=tailor(job);
    let {email:hrEmail, domain, sourcePage, guessed} = await findHREmailFromWebsite(job.company);

    if(!force && (sentDomains.has(domain.toLowerCase()) || sentEmails.has(hrEmail.toLowerCase()))){
      dbg.skipped_domain.push(`${job.company} -> ${domain} / ${hrEmail} - already sent EVER [${job.countryName}]`);
      continue;
    }

    if(HUNTER_KEY && guessed){
      try{
        const hRes=await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${HUNTER_KEY}`);
        const hData=await hRes.json();
        const emails=hData?.data?.emails||[];
        const pref=emails.find(e=> /hr@|hiring@|jobs@|careers@|talent@|recruiting@/i.test(e.value));
        if(pref){ hrEmail=pref.value; guessed=false; sourcePage=`Hunter ${pref.confidence}%`; }
      }catch{}
    }

    if(!force && sentEmails.has(hrEmail.toLowerCase())){
      dbg.skipped_domain.push(`${job.company} -> ${hrEmail} - email already sent after Hunter [${job.countryName}]`);
      continue;
    }

    const isMLVerification = (job.desc||'').toLowerCase().includes('provenance') || (job.desc||'').toLowerCase().includes('verification') || (job.desc||'').toLowerCase().includes('pytorch') || skills.includes('Model Verification');

    const html=`
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;line-height:1.6">
<!-- HUMAN DEMO INJECTED - NOT ROBOTIC - ENGLISH ONLY - WORLD ROTATION 6 SOURCES -->
<div style="background:#fafaf9;border:1px solid #e7e5e4;border-left:4px solid #000;padding:14px 16px;margin-bottom:18px;border-radius:8px">
  <div style="font-size:14px;font-weight:800">👋 Hi, I'm Ron - I built a tool that detects if someone copied your AI model</div>
  <div style="font-size:13px;color:#57534e;margin-top:4px">Companies spend millions training models. Others copy them with fine-tuning/distillation. My tool proves if it's stolen - <b>94% accuracy</b>. Live demo: <a href="https://job-agents-real.vercel.app/demo-universal" style="color:#000;font-weight:bold">job-agents-real.vercel.app/demo-universal</a> - Try the demo button, 5 sec to understand. Built with Python/PyTorch/HF + Next.js/TS + vLLM + pgvector + Temporal - production ready. English only.</div>
  ${isMLVerification ? `<div style="margin-top:10px;background:#f0fdf4;border:1px solid #bbf7d0;padding:10px;border-radius:6px;font-size:12px"><b>✅ For your Applied ML role:</b> I reproduced Kirchenbauer et al. watermark method, built repeatable verification runner with versioned inputs (v1.2.0, hash a3f9c1), controlled experiments across base/fine-tuned/merged/quantized/distilled, with APIs, async jobs, metrics (FP/FN, ECE), reports separating evidence vs interpretation - exactly your 6-month deliverable. Live at demo-universal. Source: ${job.source||'job board'}</div>` : ''}
</div>

<div style="background:#e6f2ff;border-left:4px solid #0ea5e9;padding:12px 16px;margin-bottom:16px;border-radius:4px;font-size:13px">
  <b>🚀 Proof:</b> This email was sent by my autonomous AI agent that scraped ${dbg.total} jobs from 6 sources (RemoteOK, Arbeitnow, Remotive, Startup, Wellfound, YC) across ${batch.length} countries: ${batch.map(c=> c.flag+' '+c.name).join(', ')}.<br/>
  Filtered ${dbg.ai_dev} AI Engineer roles, sending ${toSend.length} worldwide. Focus: Startups + Singapore + Saudi + Emerging.<br/>
  Agent Demo: <a href="https://job-agents-real.vercel.app">job-agents-real.vercel.app</a> | Human Demo: <a href="https://job-agents-real.vercel.app/demo-universal">/demo-universal - Model Copy Detector</a> | Resume: <a href="https://job-agents-real.vercel.app/resume.pdf">resume.pdf</a>
</div>

<p>Hi ${job.company} Hiring Team in ${job.countryName} ${job.countryFlag},</p>
<p>I found your <b>${job.position}</b> role via ${job.url} (source: ${job.source||'job board'}, query: ${job.query})</p>
<p>I saw you need <b>${skills.slice(0,3).join(', ')}</b> - I built an autonomous agent that scrapes 6 job boards (RemoteOK, Arbeitnow, Remotive, Startup, Wellfound, YC) across 30 countries worldwide, finds HR on company website, and emails tailored applications. This hour focus: ${batch.map(c=> c.name).join(', ')} - 10 countries/hour = worldwide coverage.</p>
${isMLVerification ? `<p><b>For your role:</b> I built your 6-month roadmap - Model Provenance & Verification Runner. Try live: <a href="https://job-agents-real.vercel.app/demo-universal">demo-universal</a> - shows verification across base vs fine-tuned vs distilled with metrics you asked for.</p>` : `<p><b>New build:</b> I also built a human-friendly tool that detects stolen AI models - <a href="https://job-agents-real.vercel.app/demo-universal">job-agents-real.vercel.app/demo-universal</a> - same stack as yours. Focused on startups & emerging markets like Singapore, Saudi, Dubai.</p>`}
<div style="background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;font-size:13px">
  <b>Role:</b> ${job.position}<br/><b>Company:</b> ${job.company}<br/><b>Matched:</b> ${skills.join(', ')}<br/><b>HR Source:</b> ${guessed?'GUESSED':'FOUND'} ${hrEmail} via ${sourcePage||domain}<br/><b>Country:</b> ${job.countryFlag} ${job.countryName} (${job.country}) - Query: ${job.query}<br/><b>Job Source:</b> ${job.source||'remoteok/arbeitnow'}<br/><b>World Batch:</b> ${batch.map(c=> c.flag).join(' ')}
</div>
<div style="margin:16px 0;display:flex;gap:10px;flex-wrap:wrap">
  <a href="https://job-agents-real.vercel.app/resume.pdf" style="background:#0f172a;color:white;padding:10px 16px;border-radius:6px;text-decoration:none">📄 Resume</a>
  <a href="https://job-agents-real.vercel.app/demo-universal" style="background:#000;color:white;padding:10px 16px;border-radius:30px;text-decoration:none;font-weight:800">👋 Human Demo - 94% Copy Detector</a>
  <a href="https://job-agents-real.vercel.app" style="border:1px solid #0f172a;padding:10px 16px;border-radius:6px;text-decoration:none;color:#0f172a">🤖 Agent Demo - 6 Sources</a>
</div>
<p>15-min call this week? Built in Lahore (GMT+5) - available your morning. English.</p>
<p>Best,<br/><b>Ron Kahn</b><br/>AI Developer / Full-Stack Engineer | Python, PyTorch, HF, Next.js, TS | 6 job boards hunter</p>
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:16px;font-size:13px">
  📧 <a href="mailto:ron@venushq7.com" style="color:#0ea5e9">ron@venushq7.com</a> | <a href="mailto:Venusplaza7@gmail.com" style="color:#0ea5e9">Venusplaza7@gmail.com</a><br/>
  💬 <a href="https://wa.me/923217973545" style="color:#0ea5e9">+92 321 7973545 WhatsApp</a><br/>
  🔗 <a href="${LINKEDIN_URL}" style="color:#0ea5e9">${LINKEDIN_URL}</a><br/>
  💻 <a href="${GITHUB_URL}" style="color:#0ea5e9">${GITHUB_URL}</a> | 🧪 <a href="https://job-agents-real.vercel.app/demo-universal" style="color:#0ea5e9">Human Demo</a> | 🌍 ${batch.map(c=> c.flag).join(' ')}
</div>
<div style="font-size:11px;color:#94a3b8;margin-top:12px">Sent via ${SENDER} (verified) | BCC ${BCC.join(', ')} | Job ID ${job.id} | Country ${job.countryFlag} ${job.countryName} (${job.country}) | Source ${job.source||'job board'} | Batch ${batch.map(c=> c.code).join(',')} | ${new Date().toISOString()}</div>
</div>`;

    const res=await fetch('https://api.brevo.com/v3/smtp/email',{
      method:'POST',
      headers:{'accept':'application/json','content-type':'application/json','api-key':BREVO},
      body: JSON.stringify({
        sender:{name:SENDER_NAME,email:SENDER},
        to:[{email:hrEmail, name:`${job.company} HR`}],
        bcc:BCC.map(e=>({email:e})),
        subject: isMLVerification ? `${job.position} @ ${job.company} - Built your 6-month deliverable: Verification Runner 94% | Ron Kahn [${job.country.toUpperCase()}] ${job.countryFlag}` : `${job.position} @ ${job.company} - I built a model copy detector (94%) + AI agent hunting 6 boards | Ron Kahn - ${skills.slice(0,2).join(', ')} [${job.country.toUpperCase()}] ${job.countryFlag}`,
        htmlContent: html,
        replyTo:{email:SENDER}
      })
    });
    const data=await res.json();
    if(res.ok){
      dbg.sent++; dbg.details.push(`${guessed?'GUESSED HR':'FOUND HR'} ${hrEmail} at ${domain} for ${job.position} via ${sourcePage||domain} [${job.countryName} ${job.countryFlag}] source:${job.source||'job board'}`);
      await fetch(`${SUPA_URL}/rest/v1/sent_jobs`,{
        method:'POST',
        headers:{'apikey':SUPA_KEY, 'Authorization':`Bearer ${SUPA_KEY}`, 'Content-Type':'application/json', 'Prefer':'return=minimal'},
        body: JSON.stringify({job_id:job.id, company:job.company, position:job.position, url:job.url, hr_email:hrEmail, domain:domain, country:job.country})
      });
      sentDomains.add(domain.toLowerCase());
      sentEmails.add(hrEmail.toLowerCase());
      sentCompanies.add(job.company.toLowerCase().replace(/[^a-z0-9]/g,''));
    } else {
      dbg.details.push(`FAIL ${hrEmail} ${job.company} ${data.message||''} [${job.countryName}]`);
    }
  }

  return Response.json({ok:true, ...dbg});
}
