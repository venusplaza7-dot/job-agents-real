import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

// HARDCODED FOR TEST - DELETE AFTER
const TEST_GEMINI_KEY = "AQ.Ab8RN6JdLKFO8VaAUWD7Z_mS03os-CNqJf_-eG0RBsT0O-ohUg";

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  
  const keyToUse = TEST_GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(keyToUse);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Test key first
    const test = await model.generateContent("Say hello");
    const testText = test.response.text();

    const { count: total } = await supabase.from("jobs").select("*", { count: "exact", head: true });
    const { data: toTailor } = await supabase.from("jobs").select("*").eq("tailored", false).limit(1);

    let tailored = 0;
    let errors: any[] = [];

    for (const job of toTailor || []) {
      try {
        const prompt = `Job: ${job.title} at ${job.company}\nDesc: ${(job.description||"").slice(0,2000)}\nReturn short summary`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        await supabase.from("jobs").update({ tailored: true, tailored_summary: text.slice(0,500) }).eq("id", job.id);
        tailored++;
      } catch (e:any) { errors.push(e.message); }
    }

    return NextResponse.json({ 
      success: true, 
      keyTest: testText,
      keyLength: keyToUse.length,
      keyPreview: `${keyToUse.slice(0,10)}...${keyToUse.slice(-10)}`,
      total_in_db: total, 
      tailored, 
      errors,
      message: "✅ KEY WORKS! Now DELETE this key in AI Studio and create new one"
    });

  } catch (e:any) {
    return NextResponse.json({ 
      success: false, 
      keyLength: keyToUse.length,
      keyPreview: `${keyToUse.slice(0,10)}...${keyToUse.slice(-10)}`,
      error: e.message,
      fullError: e.toString(),
      help: "Key invalid = 1) Key is cut short (should be ~150 chars, yours is 58) 2) API not enabled 3) Key deleted"
    }, { status: 400 });
  }
}
