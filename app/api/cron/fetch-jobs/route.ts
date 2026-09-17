import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
export const dynamic='force-dynamic'

export async function GET(){
  try{
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await res.json()
    const jobs = data.filter((j:any)=>j.position).slice(0,5)

    let inserted=0
    let lastError=""

    for(const job of jobs){
      const {error} = await supabase.from('jobs').insert({
        id: String(job.id),
        title: job.position,
        company: job.company,
        url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        description: (job.description||'').substring(0,3000),
        tags: job.tags || [],
        location: 'Remote',
        source: 'remoteok',
        score: 80,
        status: 'new'
      })
      if(error){ lastError = error.message } else { inserted++ }
    }

    return NextResponse.json({
      success:true,
      fetched:jobs.length,
      inserted,
      lastError,
      sample: jobs[0]?.company || 'none'
    })
  }catch(e:any){
    return NextResponse.json({success:false, error: e.message}, {status:500})
  }
}
