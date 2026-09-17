import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  try{
    const r=await fetch('https://remoteok.com/api',{headers:{'User-Agent':'Mozilla/5.0'}})
    const d=await r.json()
    const jobs=d.filter((j:any)=>j.position).slice(0,5)
    let inserted=0
    let lastError=""
    for(const j of jobs){
      const {error}=await supabase.from('jobs').insert({
        id:String(j.id),
        title:j.position,
        company:j.company,
        url:j.url,
        description:(j.description||'').slice(0,2000),
        tags: (j.tags||[]).slice(0,5),
        location:'Remote',
        source:'remoteok',
        score:80,
        status:'new'
      })
      if(error){ lastError=error.message } else { inserted++ }
    }
    return NextResponse.json({success:true,fetched:jobs.length,inserted,lastError, note:"REAL"})
  }catch(e:any){
    return NextResponse.json({success:false,error:e.message},{status:500})
  }
}
