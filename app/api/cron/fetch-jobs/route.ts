import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
export const dynamic = 'force-dynamic'
export async function GET() {
  const res = await fetch('https://remoteok.com/api?tag=full%20stack', {
    headers: { 'User-Agent': 'Imran-Afzal-Job-Agent/1.0 (Venusplaza7@gmail.com)' }
  })
  const data = await res.json()
  const jobs = data.slice(1).filter((j:any)=>j.position)
  const aiJobs = jobs.filter((j:any)=>{
    const t = `${j.position} ${j.description} ${j.tags}`.toLowerCase()
    return t.includes('ai') || t.includes('typescript') || t.includes('full stack')
  }).slice(0,20)
  let inserted=0
  for(const job of aiJobs){
    let score=0
    const jd = `${job.position} ${job.description}`.toLowerCase()
    if(jd.includes('typescript')) score+=30
    if(jd.includes('react')) score+=20
    if(jd.includes('aws')) score+=15
    if(jd.includes('ai')) score+=25
    const {error} = await supabase.from('jobs').upsert({
      id: String(job.id), title: job.position, company: job.company,
      url: job.url, description: job.description?.substring(0,8000),
      tags: job.tags||[], location: job.location||'Remote',
      source:'remoteok', score, status: score>=80?'high_match':'new'
    },{onConflict:'id'})
    if(!error) inserted++
  }
  return NextResponse.json({success:true, fetched:aiJobs.length, inserted, message:`REAL FETCH - ${inserted} jobs from RemoteOK API`})
}
