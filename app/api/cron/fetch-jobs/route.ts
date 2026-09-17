import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
export const dynamic='force-dynamic'
export async function GET(){
 try{
  const r = await fetch('https://remoteok.com/api',{headers:{'User-Agent':'Mozilla/5.0'}})
  const d = await r.json()
  const list = d.filter((x:any)=>x.position).slice(0,3)
  let ok=0, err=""
  for(const j of list){
   const {error} = await supabase.from('jobs').insert({
    id: String(j.id),
    title: j.position,
    company: j.company,
    url: j.url,
    description: (j.description||'').slice(0,2000),
    tags: j.tags||[],
    location: 'Remote',
    source: 'remoteok',
    score: 80,
    status: 'new'
   })
   if(error) err=error.message; else ok++
  }
  return NextResponse.json({success:true,fetched:list.length,inserted:ok,lastError:err})
 }catch(e:any){
  return NextResponse.json({success:false,error:e.message},{status:500})
 }
}
