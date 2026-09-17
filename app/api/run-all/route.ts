import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET(){
  try{
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: jobs } = await supabase.from('jobs').select('*').limit(3)
    
    if(!jobs || jobs.length===0){
      return NextResponse.json({success:false, error:"No jobs in DB - run /api/cron/fetch-jobs first"})
    }

    // Build draft content
    let draftBody = `Job Search Results - ${new Date().toLocaleDateString()}\n\n`
    for(const job of jobs){
      draftBody += `\n---\nCompany: ${job.company}\nTitle: ${job.title}\nURL: ${job.url}\n\nCover Letter:\nDear ${job.company} Hiring Manager,\n\nI am excited to apply for the ${job.title} position. My experience aligns well with your requirements...\n\nBest regards\nRon\n\n`
    }

    // For now return the draft (Gmail API needs refresh token)
    // This proves jobs are ready
    return NextResponse.json({
      success:true, 
      jobsFound: jobs.length,
      draftPreview: draftBody.substring(0,2000),
      message: "Jobs ready! Now we need to create Gmail draft - check your env has GMAIL_REFRESH_TOKEN",
      jobs: jobs.map((j:any)=>({company:j.company, title:j.title}))
    })

  }catch(e:any){
    return NextResponse.json({success:false, error:e.message}, {status:500})
  }
}
