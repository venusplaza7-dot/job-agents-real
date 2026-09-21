import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const GROQ_KEY = "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";
export async function GET(){
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { "Authorization": `Bearer ${GROQ_KEY}` }
  });
  const data = await res.json();
  return NextResponse.json({success: res.ok, keyLen: GROQ_KEY.length, models: data.data?.map((m:any)=>m.id) || data, full: data});
}
