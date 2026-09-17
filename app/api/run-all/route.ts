import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'
export const dynamic='force-dynamic'

export async function GET(){
 try{
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: jobs } = await supabase.from('jobs').select('*').limit(3)
  if(!jobs?.length) return NextResponse.json({success:false, error:"No jobs - run /api/cron/fetch-jobs first"})

  const oAuth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  )
  oAuth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
  const gmail = google.gmail({version:'v1', auth:oAuth2})

  let body = `Daily Job Matches - ${new Date().toDateString()}\n\n`
  for(const j of jobs){
    body += `Company: ${j.company}\nTitle: ${j.title}\nURL: ${j.url}\n\nCover Letter Draft:\nDear ${j.company} team,\nI am applying for ${j.title}. I have strong experience...\n\nBest,\nRon\n\n---\n\n`
  }

  const raw = Buffer.from(`To: ${process.env.GMAIL_USER || 'venusplaza7@gmail.com'}\nSubject: Job Drafts - ${jobs.length} roles ready\nContent-Type: text/plain; charset=utf-8\n\n${body}`).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')

  const draft = await gmail.users.drafts.create({ userId:'me', requestBody:{ message:{ raw } } })

  return NextResponse.json({success:true, draftId: draft.data.id, jobs: jobs.map((j:any)=>j.company), message:"Draft created in Gmail!"})
 }catch(e:any){
  return NextResponse.json({success:false, error:e.message, stack:e.stack?.slice(0,500)}, {status:500})
 }
}
