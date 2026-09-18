import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

function tailorHtml(baseSkills: string[], job: any){
  const d = (job.description||'').toLowerCase()
  const matched = []
  if(d.includes('react')||d.includes('next')) matched.push('Next.js/React')
  if(d.includes('supabase')) matched.push('Supabase')
  if(d.includes('vercel')) matched.push('Vercel')
  if(d.includes('ai')||d.includes('llm')) matched.push('AI Agents/LLM')
  if(d.includes('python')) matched.push('Python')
  return matched
}

export async function GET(){
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
  const {data: jobs} = await supabase.from('jobs').select('*').limit(3)
  if(!jobs?.length) return NextResponse.json({success:false, error:"No jobs - call /api/cron/fetch-jobs"})

  // Your master resume HTML (from artifact)
  const master = `IMRAN AFZAL - 30 years: LJ Systems (NT/Linux 1995-2004), Venus System wholesale (2004-2014), Phatafut B2C founder (2015-2020), AI Builder 2022+ (venus-ai-v7, rsi-monitor, job-agents-real)`

  for(const job of jobs){
    const keywords = tailorHtml([], job)
    // Gmail draft per job with tailored resume
  }
  return NextResponse.json({success:true, count:jobs.length, tailored_for: jobs.map(j=>j.title)})
}
