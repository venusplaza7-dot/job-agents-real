import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const GROQ_KEY = "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";
export async function GET(){
 const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "openai/gpt-oss-20b",
    messages: [{role:"user", content:"Say 'Groq hardcoded works for AI Developer resume'"}]
  })
 });
 const data = await res.json();
 return NextResponse.json({success: res.ok, model: "openai/gpt-oss-20b", answer: data.choices?.[0]?.message?.content || data, fullError:!res.ok? data : undefined});
}
