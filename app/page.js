export default function ResumePage() {
  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10">
      <div className="max-w-[850px] mx-auto border border-gray-200 shadow-sm p-8 md:p-10">
        
        {/* Header */}
        <h1 className="text-[28px] font-bold font-serif tracking-tight">IMRAN AFZAL</h1>
        <p className="text-[12px] font-bold text-blue-800 mt-1 tracking-wide">
          FULL-STACK AI ENGINEER — AI AGENTS & AUTOMATION — REMOTE WORLDWIDE
        </p>
        <p className="text-[9px] text-gray-600 mt-1">
          Lahore (Remote Worldwide) • venusplaza7@gmail.com • +92 321 797 3545 • github.com/venus13 • venusplaza7-dot.github.io
        </p>
        <hr className="my-4 border-black" />

        {/* SUMMARY */}
        <h2 className="text-[14px] font-bold mt-6 mb-2">PROFESSIONAL SUMMARY</h2>
        <hr className="mb-3 border-gray-300" />
        <p className="text-[12px] leading-[18px] font-serif text-gray-900">
          Full-Stack AI Engineer specializing in <b>autonomous AI agents and production systems</b>. I ship daily on Next.js 14, TypeScript, Supabase, Vercel, Python. Built <b>Job Agents Real</b> (fetches jobs → Supabase → AI-tailored resumes with Groq → Gmail OAuth automation, 24/7 cron), <b>Venus AI</b> live in 50 cities 100 domains/day/city, and <b>RSI trading monitors</b>. Own architecture, deployment, observability (traces, evals, cost & latency). Prior enterprise networking (LJ Systems) and retail-tech founder (Phatafut).
        </p>

        {/* SKILLS */}
        <h2 className="text-[14px] font-bold mt-6 mb-2">CORE SKILLS</h2>
        <hr className="mb-3 border-gray-300" />
        <div className="text-[12px] leading-[18px] font-serif space-y-1">
          <p>• <b>AI & Automation:</b> AI Agents, Autonomous Agents, MCP, GPT-4o & Vision, Claude 3.5, RAG 800k+, Vector DB, LLM APIs</p>
          <p>• <b>Frontend:</b> Next.js 14 App Router, React, TypeScript Strict, Tailwind CSS, Vue.js</p>
          <p>• <b>Backend & Data:</b> Supabase Postgres Auth Cron Realtime, Node.js, Python FastAPI, PostgreSQL, Redis, Upstash KV, GraphQL, Jest</p>
          <p>• <b>Cloud:</b> Vercel, AWS S3, Cloudflare, GitHub Actions, Linux NT Server</p>
          <p>• <b>Integrations:</b> Gmail API OAuth2, WhatsApp, Twilio, Stripe, Apollo API, TradingView</p>
        </div>

        {/* EXPERIENCE */}
        <h2 className="text-[14px] font-bold mt-6 mb-2">EXPERIENCE</h2>
        <hr className="mb-3 border-gray-300" />

        <h3 className="text-[14px] font-bold">AI Engineer & Builder — Venus AI / Independent</h3>
        <p className="text-[10px] text-gray-600 mb-2">2022 – Present | Remote | EST Overlap | Full-time</p>
        <div className="text-[12px] leading-[18px] font-serif space-y-1">
          <p>• <b>Job Agents Real (Flagship 2026):</b> Fetches remote jobs, deduplicates in Supabase, tailors resumes with Groq, auto-creates Gmail drafts via OAuth2, runs 24/7 on Vercel cron. Every email BCC'd to venusailux@gmail.com for audit proof. Fixed 8% duplicate at 1 AM with Upstash KV lock → 0%.</p>
          <p>• <b>95% Accuracy Filter:</b> Spots 2001-2020 style sites with 95% accuracy — no human QA, 10k+ domains scanned, uses GPT-4o Vision.</p>
          <p>• <b>Venus AI React Pro Live:</b> AI assistant with activation & outreach — live at venus-ai-v8.vercel.app, 100 domains/day/city, 50 cities. V7 open-source on GitHub.</p>
          <p>• <b>Venus Outreach:</b> 800k RAG + Apollo licensed API, compliant LinkedIn automation (60-day max, 60-120s delay).</p>
          <p>• <b>RSI Monitor & Guard:</b> Trading monitors with RSI risk guards and real-time alerts.</p>
          <p>• <b>Observability:</b> Full Supabase observability — traces, evals, cost & latency budgets, golden datasets.</p>
        </div>

        <h3 className="text-[14px] font-bold mt-4">Founder — Phatafut</h3>
        <p className="text-[10px] text-gray-600 mb-1">2015 – 2020 | Lahore</p>
        <p className="text-[12px] leading-[18px] font-serif">• B2C platform digitizing small stores for online ordering — optimized for low-end Android and low bandwidth. Led product, vendor onboarding, logistics and GTM.</p>

        <h3 className="text-[14px] font-bold mt-4">Owner — Venus System</h3>
        <p className="text-[10px] text-gray-600 mb-1">2004 – 2014 | Lahore / USA</p>
        <p className="text-[12px] leading-[18px] font-serif">• USA-Pakistan computer import wholesale — procurement, customs, B2B network, pricing and after-sales.</p>

        <h3 className="text-[14px] font-bold mt-4">Network Engineer — LJ Systems</h3>
        <p className="text-[10px] text-gray-600 mb-1">1995 – 2004 | Pakistan</p>
        <p className="text-[12px] leading-[18px] font-serif">• Deployed NT/Linux servers and corporate networks, network security, user management for enterprise clients.</p>

        {/* PROJECTS */}
        <h2 className="text-[14px] font-bold mt-6 mb-2">SELECTED PROJECTS</h2>
        <hr className="mb-3 border-gray-300" />
        <div className="text-[12px] leading-[18px] font-serif space-y-1">
          <p>• <b>AI SDLC Command Center</b> — ai-sdlc-preview.vercel.app — Autonomous loop ships prod code daily</p>
          <p>• <b>Open Exposure</b> — Free open-source Daybreak alternative — real GitHub org scan, 100% local</p>
          <p>• <b>Venus Agent HQ</b> — venus-agent-hq.vercel.app — JST multi-agent team for APAC</p>
        </div>

        {/* AVAILABILITY */}
        <h2 className="text-[14px] font-bold mt-6 mb-2">AVAILABILITY</h2>
        <hr className="mb-3 border-gray-300" />
        <p className="text-[12px] leading-[18px] font-serif font-bold">
          Remote Worldwide — Full-time, Immediate start, EST & AEST overlap, No visa needed. I ship fast, monitor everything. Every email BCC'd to venusailux@gmail.com so there's always proof.
        </p>

        <div className="mt-8 flex gap-3">
          <a href="/resume.pdf" download className="bg-black text-white px-4 py-2 text-[12px] font-bold">Download PDF (14/12 Bold)</a>
          <a href="mailto:venusplaza7@gmail.com" className="border border-black px-4 py-2 text-[12px] font-bold">Contact</a>
        </div>

        <p className="text-[9px] text-gray-500 mt-8 text-center">
          This page = exactly what HR sees + PDF attached in autonomous emails. Tailored version per JD is generated by Groq and stored in Supabase jobs table.
        </p>
      </div>
    </div>
  );
}
 const dynamic = 'force-dynamic';
async function getJobs() {
  try {
    const url = process.env.VERCEL_URL? `https://${process.env.VERCEL_URL}/api/agent` : null;
    return [];
  } catch { return []; }
}
export default async function Page() {
  return (
    <div style={{padding:30, fontFamily:'system-ui'}}>
      <h1>🤖 Job Agents - Autonomous</h1>
      <p>Groq hardcoded ✅ Private repo ✅</p>
      <a href="/api/agent" style={{padding:'12px 20px', background:'black', color:'white', borderRadius:8, textDecoration:'none'}}>Run Scraper Now</a>
      <p style={{marginTop:20}}>Cron runs hourly automatically. Check Supabase table `jobs` for tailored resumes.</p>
    </div>
  );
}
