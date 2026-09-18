export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

export async function GET(){
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(url, key)
  
  const {data:jobs} = await supabase.from('jobs').select('*').order('created_at',{ascending:false}).limit(3)
  if(!jobs?.length) return Response.json({success:false, error:"No jobs - call /api/cron/fetch-jobs first"})

  const tRes = await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type:'refresh_token'
    })
  })
  const tok:any = await tRes.json()
  if(!tok.access_token) return Response.json({success:false, error:"Gmail token failed - check GMAIL_CLIENT_ID/SECRET/REFRESH", details:tok, envCheck:{has_id:!!process.env.GMAIL_CLIENT_ID, has_secret:!!process.env.GMAIL_CLIENT_SECRET, has_refresh:!!process.env.GMAIL_REFRESH_TOKEN, has_user:!!process.env.GMAIL_USER}})

  let drafted=0
  let errors=[]
  for(const job of jobs){
    const html = `<h2>Tailored Application: ${job.title} @ ${job.company} - Full-Stack AI Developer</h2>
    <p><b>Imran Afzal</b> | venusplaza7@gmail.com | 03217973545 | Lahore - Remote</p>
    <p>30 years: LJ Systems (NT/Linux 1995-2004) → Venus System import wholesale (2004-2014) → Phatafut B2C founder (2015-2020) → AI Builder 2022+ (venus-ai-v7, job-agents-real, rsi-monitor)</p>
    <p><b>Built exact stack for this JD:</b> Next.js 14, Supabase, Vercel, AI Agents, Gmail API, TypeScript - live at job-agents-real (this system auto-fetches + tailors + drafts)</p>
    <p>Job: <a href="${job.url}">${job.url}</a></p><p>Description: ${job.description?.slice(0,800)}</p>`

    const mime = `To: ${process.env.GMAIL_USER}\r\nSubject: Application - ${job.title} @ ${job.company} - Full Stack AI - Imran Afzal\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`
    const raw = Buffer.from(mime).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
    
    const dRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{
      method:'POST',
      headers:{Authorization:`Bearer ${tok.access_token}`,'Content-Type':'application/json'},
      body: JSON.stringify({message:{raw}})
    })
    const dData:any = await dRes.json()
    if(dData.id) drafted++
    else errors.push(dData)
  }
  return Response.json({success:true, drafted, errors, check:"Gmail -> Drafts"})
}
