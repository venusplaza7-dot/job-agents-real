import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

// TEST KEY - DELETE AFTER
const TEST_KEY = "AQ.Ab8RN6JdLKFO8VaAUWD7Z_mS03os-CNqJf_-eG0RBsT0O-ohUg";

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const ai = new GoogleGenAI({ apiKey: TEST_KEY });

  try {
    const test = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Say hello in 5 words"
    });
    const testText = test.text;

    const { count: total } = await supabase.from("jobs").select("*", { count: "exact", head: true });
    const { data: toTailor } = await supabase.from("jobs").select("*").eq("tailored", false).limit(1);

    let tailored = 0;
    for (const job of toTailor || []) {
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Job: ${job.title} at ${job.company} - Summarize in 20 words: ${(job.description||"").slice(0,2000)}`
      });
      await supabase.from("jobs").update({ tailored: true, tailored_summary: result.text?.slice(0,500) }).eq("id", job.id);
      tailored++;
    }

    return NextResponse.json({ success: true, keyLength: TEST_KEY.length, test: testText, total, tailored, message: "✅ AQ KEY WORKS WITH NEW LIBRARY!" });
  } catch (e:any) {
    return NextResponse.json({ success: false, keyLength: TEST_KEY.length, error: e.message, full: e.toString() }, { status: 400 });
  }
}
