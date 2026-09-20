import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

const BASE_RESUME = `RON KAHN - AI Developer Remote | Full Stack AI | Python, TypeScript, Next.js 14, React, Node, Supabase, Vercel, OpenAI, LangChain, RAG, Gmail API, OAuth2 | Built job-agents-real autonomous system`;

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const { data: jobs } = await supabase.from("jobs").select("*").eq("tailored", false).limit(2);
  let tailored = 0;
  for (const job of jobs || []) {
    const prompt = `Tailor resume for AI Developer Remote job. Base: ${BASE_RESUME}. Job: ${job.title} at ${job.company} JD: ${(job.description||"").slice(0,3000)}. Return JSON with tailored_summary, cover_letter`;
    const result = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    let text = (result.text||"").replace(/```json|```/g,"");
    let parsed; try{ parsed = JSON.parse(text); }catch{ parsed = { tailored_summary: text.slice(0,400), cover_letter: text }; }
    await supabase.from("jobs").update({ tailored:true, tailored_summary: parsed.tailored_summary, cover_letter: parsed.cover_letter }).eq("id", job.id);
    tailored++;
  }
  return NextResponse.json({ success:true, tailored });
}
