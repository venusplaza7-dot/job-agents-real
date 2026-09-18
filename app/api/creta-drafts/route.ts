export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

export async function GET(){
  const supabase = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data:jobs} = await supabase.from('jobs').select('*').order('created_at',{ascending:false}).limit(3)
  
  const tokenRes = await fetch('https://oauth2.googleapis.com/token',{method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({client_id:process.env.GMAIL_CLIENT_ID!,client_secret:process.env.GMAIL_CLIENT_SECRET!,refresh_token:process.env.GMAIL_REFRESH_TOKEN!,grant_type:'refresh_token'})})
  const tok:any = await tokenRes.json()
  if(!tok.access_token) return Response.json({success:false, error:"Gmail token failed", tok})

  let drafted=0
  for(const job of jobs||[]){
    const html = `<h2>Tailored for ${job.title} @ ${job.company} - Full-Stack AI Developer</h2>
    <p>Imran Afzal | venusplaza7@gmail.com | 03217973545</p>
    <p>30 years: LJ Systems (NT/Linux 1995-2004), Venus System wholesale (2004-2014), Phatafut B2C founder (2015-2020), AI Builder 2022+ (venus-ai-v7, job-agents-real, rsi-monitor/guard)</p>
    <p>Matched JD: Next.js, Supabase, Vercel, AI Agents, TypeScript, Gmail API - Built exactly this system: job-agents-real automates fetch + tailored resume + drafts</p>
    <p>Link: ${job.url}</p>`

    const mime = `To: ${process.env.GMAIL_USER}\r\nSubject: Application - ${job.title} @ ${job.company} - Full Stack AI Developer - Imran Afzal\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`
    const raw = Buffer.from(mime).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{method:'POST', headers:{Authorization:`Bearer ${tok.access_token}`,'Content-Type':'application/json'}, body:JSON.stringify({message:{raw}})})
    const data:any = await res.json()
    if(data.id) drafted++
  }
  return Response.json({success:true, drafted, check:"Gmail -> Drafts -> venusplaza7@gmail.com"})
}
