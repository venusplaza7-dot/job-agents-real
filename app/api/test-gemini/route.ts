import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const GROQ_KEY = "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";
export async function GET(){
 try{
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{role:"user", content:"Say 'Groq works for AI Developer resume' in 8 words"}],
      max_tokens: 50
    })
  });
  const data = await res.json();
  if(!res.ok) return NextResponse.json({success:false, model:"openai/gpt-oss-20b", error:data}, {status:500});
  return NextResponse.json({success:true, answer: data.choices[0].message.content, model: "openai/gpt-oss-20b", message:"✅ HARDCODED GROQ WORKS!"});
 }catch(e:any){
  return NextResponse.json({success:false, error:e.message}, {status:500});
 }
}
