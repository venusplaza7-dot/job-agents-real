export const dynamic = 'force-dynamic';
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
