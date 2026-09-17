import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { google } from 'googleapis'
export async function POST(req:Request){
  const {job_id}=await req.json()
  const {data:job}=await supabase.from('jobs').select('*').eq('id',job_id).single()
  const oauth2Client=new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET)
  oauth2Client.setCredentials({refresh_token:process.env.GMAIL_REFRESH_TOKEN})
  const gmail=google.gmail({version:'v1',auth:oauth2Client})
  const subject=`Built preview for ${job.company} - ${job.title} - Imran Afzal`
  const body=`Hi ${job.company} team,\n\nSaw ${job.title} role.\n\nBuilt preview: https://ai-sdlc-preview.vercel.app\nLive: open-exposure.vercel.app | venus-outreach.vercel.app\n\nCan I ship 1-day trial?\n\nImran Afzal | Venusplaza7@gmail.com | +92 321 7973545`
  const raw=Buffer.from(`From: Imran <${process.env.USER_EMAIL}>\r\nTo: ${process.env.USER_EMAIL}\r\nSubject: ${subject}\r\n\r\n${body}`).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
  const draft=await gmail.users.drafts.create({userId:'me', requestBody:{message:{raw}}})
  await supabase.from('jobs').update({status:'draft_created'}).eq('id',job.id)
  return NextResponse.json({success:true, draftId:draft.data.id, message:`Draft created for ${job.company}`})
}
