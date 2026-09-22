export default function Page() {
  return (
    <div style={{padding:30, fontFamily:'Times New Roman, serif', maxWidth:900, margin:'0 auto', background:'white', color:'black'}}>
      <h1 style={{fontSize:28, fontWeight:'bold', margin:0}}>IMRAN AFZAL</h1>
      <p style={{fontSize:12, fontWeight:'bold', marginTop:4, color:'#1e40af'}}>FULL-STACK AI ENGINEER — AI AGENTS & AUTOMATION — REMOTE WORLDWIDE</p>
      <p style={{fontSize:9, color:'#4b5563', marginTop:4}}>Lahore (Remote Worldwide) • venusplaza7@gmail.com • +92 321 797 3545 • github.com/venus13</p>
      <hr style={{margin:'12px 0', border:'1px solid black'}} />

      <h2 style={{fontSize:14, fontWeight:'bold', marginTop:20}}>PROFESSIONAL SUMMARY</h2>
      <hr style={{margin:'6px 0 8px 0'}} />
      <p style={{fontSize:12, lineHeight:'18px'}}>
        Full-Stack AI Engineer specializing in <b>autonomous AI agents and production systems</b>. I ship daily on Next.js 14, TypeScript, Supabase, Vercel, Python. Built <b>Job Agents Real</b> (fetches jobs → Supabase → AI-tailored resumes with Groq → Gmail OAuth automation, 24/7 cron), <b>Venus AI</b> live in 50 cities 100 domains/day/city, and <b>RSI trading monitors</b>. Own architecture, deployment, observability (traces, evals, cost & latency). Prior enterprise networking (LJ Systems) and retail-tech founder (Phatafut).
      </p>

      <h2 style={{fontSize:14, fontWeight:'bold', marginTop:20}}>CORE SKILLS</h2>
      <hr style={{margin:'6px 0 8px 0'}} />
      <div style={{fontSize:12, lineHeight:'18px'}}>
        <p>• <b>AI & Automation:</b> AI Agents, Autonomous Agents, MCP, GPT-4o & Vision, Claude 3.5, RAG 800k+, Vector DB, LLM APIs</p>
        <p>• <b>Frontend:</b> Next.js 14 App Router, React, TypeScript Strict, Tailwind CSS, Vue.js</p>
        <p>• <b>Backend & Data:</b> Supabase Postgres Auth Cron Realtime, Node.js, Python FastAPI, PostgreSQL, Redis, Upstash KV, GraphQL, Jest</p>
        <p>• <b>Cloud:</b> Vercel, AWS S3, Cloudflare, GitHub Actions, Linux NT Server</p>
        <p>• <b>Integrations:</b> Gmail API OAuth2, WhatsApp, Twilio, Stripe, Apollo API, TradingView</p>
      </div>

      <h2 style={{fontSize:14, fontWeight:'bold', marginTop:20}}>EXPERIENCE</h2>
      <hr style={{margin:'6px 0 8px 0'}} />

      <h3 style={{fontSize:14, fontWeight:'bold', marginTop:12}}>AI Engineer & Builder — Venus AI / Independent</h3>
      <p style={{fontSize:10, color:'#6b7280'}}>2022 – Present | Remote | EST Overlap | Full-time</p>
      <div style={{fontSize:12, lineHeight:'18px'}}>
        <p>• <b>Job Agents Real (Flagship 2026):</b> Fetches remote jobs, deduplicates in Supabase, tailors resumes with Groq, auto-creates Gmail drafts via OAuth2, runs 24/7 on Vercel cron. Every email BCC'd to venusailux@gmail.com for audit proof. Fixed 8% duplicate at 1 AM with Upstash KV lock → 0%.</p>
        <p>• <b>95% Accuracy Filter:</b> Spots 2001-2020 style sites with 95% accuracy — no human QA, 10k+ domains scanned, uses GPT-4o Vision.</p>
        <p>• <b>Venus AI React Pro Live:</b> live at venus-ai-v8.vercel.app, 100 domains/day/city, 50 cities. V7 open-source on GitHub.</p>
        <p>• <b>Venus Outreach:</b> 800k RAG + Apollo licensed API, compliant LinkedIn automation (60-day max, 60-120s delay).</p>
        <p>• <b>Observability:</b> Full Supabase observability — traces, evals, cost & latency budgets.</p>
      </div>

      <h3 style={{fontSize:14, fontWeight:'bold', marginTop:12}}>Founder — Phatafut</h3>
      <p style={{fontSize:10, color:'#6b7280'}}>2015 – 2020 | Lahore</p>
      <p style={{fontSize:12, lineHeight:'18px'}}>• B2C platform digitizing small stores for online ordering — optimized for low-end Android and low bandwidth.</p>

      <h3 style={{fontSize:14, fontWeight:'bold', marginTop:12}}>Owner — Venus System</h3>
      <p style={{fontSize:10, color:'#6b7280'}}>2004 – 2014 | Lahore / USA</p>
      <p style={{fontSize:12, lineHeight:'18px'}}>• USA-Pakistan computer import wholesale — procurement, customs, B2B network.</p>

      <h3 style={{fontSize:14, fontWeight:'bold', marginTop:12}}>Network Engineer — LJ Systems</h3>
      <p style={{fontSize:10, color:'#6b7280'}}>1995 – 2004 | Pakistan</p>
      <p style={{fontSize:12, lineHeight:'18px'}}>• Deployed NT/Linux servers and corporate networks, network security, user management.</p>

      <h2 style={{fontSize:14, fontWeight:'bold', marginTop:20}}>SELECTED PROJECTS</h2>
      <hr style={{margin:'6px 0 8px 0'}} />
      <div style={{fontSize:12, lineHeight:'18px'}}>
        <p>• <b>AI SDLC Command Center</b> — ai-sdlc-preview.vercel.app — Autonomous loop ships prod code daily</p>
        <p>• <b>Open Exposure</b> — Free open-source Daybreak alternative — real GitHub org scan, 100% local</p>
        <p>• <b>Venus Agent HQ</b> — venus-agent-hq.vercel.app — JST multi-agent team for APAC</p>
      </div>

      <h2 style={{fontSize:14, fontWeight:'bold', marginTop:20}}>AVAILABILITY</h2>
      <hr style={{margin:'6px 0 8px 0'}} />
      <p style={{fontSize:12, fontWeight:'bold'}}>Remote Worldwide — Full-time, Immediate start, EST & AEST overlap, No visa needed. I ship fast, monitor everything. Every email BCC'd to venusailux@gmail.com so there's always proof.</p>

      <div style={{marginTop:20}}>
        <a href="/resume.pdf" style={{padding:'8px 16px', background:'black', color:'white', textDecoration:'none', fontSize:12, fontWeight:'bold', marginRight:10}}>Download PDF (14/12 Bold)</a>
        <a href="/api/agent" style={{padding:'8px 16px', border:'1px solid black', textDecoration:'none', fontSize:12, fontWeight:'bold', color:'black'}}>Run Autonomous Agent</a>
      </div>

      <p style={{fontSize:10, color:'#6b7280', marginTop:20, textAlign:'center'}}>HR gets this page + PDF. Tailored version per JD stored in Supabase jobs table. Audit BCC to venusailux@gmail.com</p>
    </div>
  );
}
