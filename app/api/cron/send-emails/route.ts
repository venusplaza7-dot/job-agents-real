import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const GROQ_KEY = "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";
const BASE = `Ron Kahn - AI Developer Remote, Full Stack AI, 6+ yrs TS, Next.js 14, Node, Supabase, OpenAI, LangChain, RAG, AI Agents, MCPs. Built job-agents-real on Vercel with Groq gpt-oss-20b`;
export async function GET(){
 const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
 const {data: jobs} = await supabase.from("jobs").select("*").eq("tailored", false).limit(3);
 let done=0, out=[];
 for(const j of jobs||[]){
  const prompt = `Tailor resume JSON for AI Developer Remote. Base:${BASE}. Job:${j.title} at ${j.company} JD:${(j.description||"").slice(0,2000)}. Return ONLY JSON: {"tailored_summary":"...","cover_letter":"...","keywords":"..."}`;
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
   method:"POST", headers:{"Authorization":`Bearer ${GROQ_KEY}`,"Content-Type":"application/json"},
   body: JSON.stringify({model:"openai/gpt-oss-20b", messages:[{role:"user",content:prompt}], max_tokens:800})
  });
  const d = await r.json();
  let txt = d.choices?.[0]?.message?.content?.replace(/```json|```/g,"").trim()||"{}";
  let p; try{p=JSON.parse(txt);}catch{p={tailored_summary:txt.slice(0,400), cover_letter:txt};}
  await supabase.from("jobs").update({tailored:true, tailored_summary:p.tailored_summary, cover_letter:p.cover_letter}).eq("id",j.id);
  done++; out.push({company:j.company,...p});
 }
 return NextResponse.json({success:true, tailored:done, results:out});
}
