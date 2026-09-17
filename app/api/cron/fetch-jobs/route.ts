import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

export async function GET(){
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if(!url || !key || url.includes('placeholder')){
    return NextResponse.json({
      success:false, 
      error:`Missing env at build time - url present:${!!url} key present:${!!key}`,
      hint:"Make sure SUPABASE_URL is checked for Preview + Production + Development"
    }, {status:500})
  }

  const supabase = createClient(url, key)
  try{
    const r = await fetch('https://remoteok.com/api', {headers:{'User-Agent':'Mozilla/5.0'}})
    const d = await r.json()
    const jobs = d.filter((j:any)=>j.position).slice(0,3)
    let inserted=0, lastErr=""
    for(const j of jobs){
      const {error} = await supabase.from('jobs').upsert({
        id:String(j.id),
        title:j.position,
        company:j.company,
        url:j.url,
        description:(j.description||'').slice(0,2000),
        source:'remoteok',
        status:'new'
      }, {onConflict:'id'})
      if(error) lastErr=error.message; else inserted++
    }
    return NextResponse.json({success:true, fetched:jobs.length, inserted, lastErr, envOk:true})
  }catch(e:any){
    return NextResponse.json({success:false, error:e.message}, {status:500})
  }
}
