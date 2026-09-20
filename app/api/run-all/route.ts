import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const { count: total } = await supabase.from("jobs").select("*", { count: "exact", head: true });
  const { data: toTailor } = await supabase.from("jobs").select("*").eq("tailored", false).limit(2);

  let tailored = 0, emailed = 0, errors:any[] = [];
  for (const job of toTailor || []) {
    try {
      const prompt = `Job: ${job.title} at ${job.company}\nDesc: ${(job.description||"").slice(0,2000)}\nReturn JSON: {"tailored_summary":"...","cover_letter":"..."}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      await supabase.from("jobs").update({ tailored: true, tailored_summary: text.slice(0,500) }).eq("id", job.id);
      tailored++;
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({ from: "onboarding@resend.dev", to: ["ron@venushq7.com"], subject: `Tailored: ${job.title}`, html: text });
        await supabase.from("jobs").update({ emailed: true }).eq("id", job.id);
        emailed++;
      }
    } catch (e:any) { errors.push(e.message); }
  }
  return NextResponse.json({ success: true, total_in_db: total, tailored, emailed, errors });
}
