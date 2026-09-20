import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const dynamic = "force-dynamic";
export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const { data: jobs } = await supabase.from("jobs").select("*").eq("tailored", false).limit(2);
  let tailored = 0;
  for (const job of jobs || []) {
    const r = await model.generateContent(`Tailor resume for ${job.title}: ${job.description?.slice(0,2000)}`);
    await supabase.from("jobs").update({ tailored: true, tailored_summary: r.response.text() }).eq("id", job.id);
    tailored++;
  }
  return NextResponse.json({ tailored });
}
