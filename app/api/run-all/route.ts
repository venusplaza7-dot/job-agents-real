import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET(){
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_KEY! // MUST be service key, not anon
  const supabase = createClient(url, key)
  
  const { data: jobs, error } = await supabase.from('jobs').select('*').order('created_at', {ascending:false}).limit(5)
  
  if(error) return NextResponse.json({success:false, error:error.message, where:"select"})
  if(!jobs || jobs.length===0) {
    // Check count without filter to debug
    const { count } = await supabase.from('jobs').select('*', {count:'exact', head:true})
    return NextResponse.json({success:false, error:"No jobs yet", debug_count:count, hint:"fetch-jobs inserted but RLS blocking anon key - using service key now"})
  }

  // Gmail draft creation - simplified preview mode
  // Once this shows count=3, add gmail logic
  return NextResponse.json({
    success:true, 
    count: jobs.length,
    jobs: jobs.map((j:any)=>({title:j.title, company:j.company})),
    message:"Jobs found! Now Gmail draft will work - add GMAIL_USER env if you see preview_only next",
    mode:"preview_ready"
  })
}
