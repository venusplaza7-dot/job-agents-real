export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

export async function GET(){
  const supabase = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data:jobs} = await supabase.from('jobs').select('*').order('created_at',{ascending:false}).limit(3)
  
  const tailored = jobs?.map(job=>{
    const jd = (job.description||'').toLowerCase()
    const keywords = []
    if(jd.includes('react')||jd.includes('next')) keywords.push('Next.js 14')
    if(jd.includes('supabase')) keywords.push('Supabase')
    if(jd.includes('vercel')) keywords.push('Vercel')
    if(jd.includes('ai')||jd.includes('llm')) keywords.push('AI Agents/LLM')
    if(jd.includes('typescript')) keywords.push('TypeScript')
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      tailored_summary: `Full-Stack AI Developer with ${keywords.join(', ')} - Built job-agents-real (Next.js+Supabase+Vercel+Gmail API), venus-ai-v7, rsi-monitor/guard - 30 years from NT/Linux (LJ Systems 1995-2004) to AI founder (Phatafut 2015-2020)`,
      matched_keywords: keywords
    }
  })
  return Response.json({success:true, tailored})
}
