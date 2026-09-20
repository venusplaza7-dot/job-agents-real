import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.GEMINI_API_KEY || "";
  const keyPreview = key ? `${key.slice(0, 10)}...${key.slice(-10)} (length: ${key.length})` : "MISSING";

  try {
    if (!key) throw new Error("GEMINI_API_KEY not set in Vercel");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in 5 words");
    const text = result.response.text();

    return NextResponse.json({ 
      success: true, 
      keyPreview, 
      geminiResponse: text,
      message: "✅ KEY IS VALID! Now generate new key and update Vercel"
    });
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      keyPreview, 
      error: e.message,
      help: "Key invalid - check: 1) No spaces 2) Full key copied 3) Generative Language API enabled in Google Cloud"
    }, { status: 400 });
  }
}
