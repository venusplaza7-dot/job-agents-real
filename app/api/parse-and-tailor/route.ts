import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
export const dynamic = "force-dynamic";
export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const { data: jobs } = await supabase.from("jobs").select("*").eq("tailored", false).limit(2);
  let tailored = 0;
  for (const job of jobs || []) {
    const r = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: `Tailor resume for ${job.title}: ${job.description?.slice(0,2000)}` });
    await supabase.from("jobs").update({ tailored: true, tailored_summary: r.text }).eq("id", job.id);
    tailored++;
  }
  return NextResponse.json({ tailored });
}
