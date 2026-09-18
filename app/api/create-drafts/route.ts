export const dynamic='force-dynamic'
import {createClient} from '@supabase/supabase-js'
export async function GET(){
  const supabase=createClient(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data:jobs}=await supabase.from('jobs').select('*').order('created_at',{ascending:false}).limit(3)
  if(!jobs?.length) return Response.json({success:false, error:"no jobs"})
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.GMAIL_CLIENT_ID!,client_secret:process.env.GMAIL_CLIENT_SECRET!,refresh_token:process.env.GMAIL_REFRESH_TOKEN!,grant_type:'refresh_token'})})
  const t:any=await r.json()
  if(!t.access_token) return Response.json({success:false,error:"gmail token failed",details:t})
  let drafted=0
  for(const j of jobs){
    const mime=`To: ${process.env.GMAIL_USER}\r\nSubject: ${j.title} @ ${j.company} - Full Stack AI\r\nContent-Type: text/html\r\n\r\n<h2>${j.title}</h2><p>${j.url}</p><p>${j.description?.slice(0,600)}</p>`
    const raw=Buffer.from(mime).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
    const d=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{method:'POST',headers:{Authorization:`Bearer ${t.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({message:{raw}})})
    const jd:any=await d.json()
    if(jd.id) drafted++
  }
  return Response.json({success:true,drafted})
}
