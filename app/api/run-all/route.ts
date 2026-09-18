import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET(){
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if(!url || !key) return NextResponse.json({success:false, error:"Missing env", url:!!url, key:!!key, hint:"Add SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel and check all 3 env boxes"})

  const supabase = createClient(url, key)
  const { data: jobs } = await supabase.from('jobs').select('*').limit(3)
  return NextResponse.json({success:true, count: jobs?.length||0, jobs: jobs?.map((j:any)=>j.title)})
}
