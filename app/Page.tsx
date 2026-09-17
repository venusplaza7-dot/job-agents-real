export default function Home(){
  return (
    <div style={{padding:40, fontFamily:'sans-serif', background:'#111', color:'white', minHeight:'100vh'}}>
      <h1>✅ Job Agents REAL LIVE — Imran Afzal</h1>
      <p>Venusplaza7@gmail.com | +92 321 7973545</p>
      <hr style={{margin:'20px 0'}}/>
      <h2>Test REAL Fetch:</h2>
      <a href="/api/cron/fetch-jobs" style={{color:'#0f0', fontSize:20}}>
        CLICK HERE: /api/cron/fetch-jobs — REAL RemoteOK API
      </a>
      <p style={{marginTop:20}}>This will fetch live Full Stack AI jobs into Supabase</p>
      <h3>Your 4 Agents:</h3>
      <ul>
        <li>Agent 1: /api/cron/fetch-jobs — REAL LIVE FETCH (RemoteOK)</li>
        <li>Agent 2: /api/parse-and-tailor — Tailor resume bullets</li>
        <li>Agent 3: /api/create-drafts — Gmail drafts (not auto-send)</li>
        <li>Agent 4: Dashboard — shows jobs</li>
      </ul>
    </div>
  )
}
