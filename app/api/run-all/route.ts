import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET(){
 try{
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', {ascending:false}).limit(3)
  
  if(!jobs || jobs.length===0){
    return NextResponse.json({success:false, error:"No jobs yet - open /api/cron/fetch-jobs first"})
  }

  // --- GMAIL PART (no library) ---
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  const gmailUser = process.env.GMAIL_USER || 'venusplaza7@gmail.com'

  if(!clientId || !clientSecret || !refreshToken){
    return NextResponse.json({
      success:true, 
      mode:"preview_only",
      message:"Jobs found but GMAIL env missing - add GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN in Vercel",
      jobs,
      envCheck: { hasClientId: !!clientId, hasSecret: !!clientSecret, hasRefresh: !!refreshToken }
    })
  }

  // 1. Get access token from refresh token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })
  const tokenData = await tokenRes.json()
  if(!tokenData.access_token){
    return NextResponse.json({success:false, error:"Failed to get access token", details: tokenData}, {status:500})
  }

  // 2. Build email draft
  let emailBody = `Daily Job Matches - ${new Date().toDateString()}\n\nFound ${jobs.length} roles:\n\n`
  for(const j of jobs){
    emailBody += `--------------------\nCompany: ${j.company}\nRole: ${j.title}\nURL: ${j.url}\n\nCover Letter:\nDear ${j.company} Hiring Manager,\n\nI am excited to apply for the ${j.title} role. My experience in AI agents and automation aligns perfectly with your stack.\n\nBest regards,\nRon\n\n`
  }

  const rawEmail = [
    `To: ${gmailUser}`,
    `Subject: Job Drafts Ready - ${jobs.length} roles - ${new Date().toLocaleDateString()}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    emailBody
  ].join('\n')

  const raw = Buffer.from(rawEmail).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')

  // 3. Create draft
  const draftRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method:'POST',
    headers:{
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message:{ raw } })
  })
  const draftData = await draftRes.json()

  if(draftData.error){
    return NextResponse.json({success:false, error:"Gmail API error", details: draftData}, {status:500})
  }

  return NextResponse.json({success:true, draftId: draftData.id, message:"Draft created in Gmail!", jobs: jobs.map((j:any)=>j.company)})
 }catch(e:any){
  return NextResponse.json({success:false, error:e.message}, {status:500})
 }
}
