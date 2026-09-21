import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const GROQ_KEY = "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";

export async function GET(){
 try{
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{role:"user", content:"Say hello in 5 words, testing Groq API for AI Developer job"}],
      max_tokens: 50
    })
  });
  const data = await res.json();
  if(!res.ok) return NextResponse.json({success:false, model:"llama3-8b-8192", groqError:data, keyLen: GROQ_KEY.length}, {status:500});
  return NextResponse.json({success:true, answer: data.choices[0].message.content, model: "llama3-8b-8192", message:"✅ GROQ HARDCODED WORKS - READY FOR RESUME TAILORING"});
 }catch(e:any){
  return NextResponse.json({success:false, error:e.message}, {status:500});
 }
}
