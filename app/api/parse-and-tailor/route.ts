import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
export async function POST(req:Request){
  const {job_id}=await req.json()
  const {data:job}=await supabase.from('jobs').select('*').eq('id',job_id).single()
  if(!job) return NextResponse.json({error:'Not found'},{status:404})
  const jd=(job.description||'').toLowerCase()
  const bullets=[]
  if(jd.includes('typescript')) bullets.push("Strong TS/JS 6+ yrs: TS Strict, Next.js 14, React, Node, GraphQL")
  if(jd.includes('ai')||jd.includes('cursor')) bullets.push("Daily AI Coding + Custom Agents/MCPs: Cursor, Copilot, Claude 3.5 - Autonomous loop daily")
  if(jd.includes('aws')) bullets.push("AWS + Node React GraphQL: S3, Cloudflare, Vercel, Supabase, Jest")
  if(jd.includes('monitor')||jd.includes('security')) bullets.push("Own monitoring, AWS infra, security audits - Open Exposure")
  const tailored={company:job.company, title:job.title, bullets}
  await supabase.from('tailored_resumes').insert({job_id:job.id, company:job.company, tailored_bullets:tailored})
  await supabase.from('jobs').update({status:'tailored'}).eq('id',job.id)
  return NextResponse.json({success:true, tailored})
}
