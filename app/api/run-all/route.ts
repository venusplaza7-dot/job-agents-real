import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

// YOUR BASE RESUME - AI Developer Remote
const BASE_RESUME = `
RON KAHN - AI Developer | Full Stack AI | Remote
Lahore, Pakistan | Remote - US/EU overlap
Stack: Python, TypeScript, Next.js 14, Node, React, Supabase, Vercel, OpenAI API, LangChain, RAG, Vector DBs, Gmail API, OAuth2
Projects: job-agents-real (autonomous AI job applier with Gmail drafts, Supabase, Gemini), open-exposure, venus-outreach
Experience: 5+ years building AI agents, LLM workflows, automation that reduces manual work 90%
Looking for: Full Stack AI Developer Remote roles - LLM, Agents, RAG, MCPs, Daily AI coding tools
`;

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const { count: total } = await supabase.from("jobs").select("*", { count: "exact", head: true });
  const { data: jobs } = await supabase.from("jobs").select("*").eq("tailored", false).limit(2);

  let tailored = 0, errors:any[] = [];
  for (const j of jobs || []) {
    try {
      const prompt = `You are resume tailor for Remote Full Stack AI Developer jobs.
Base Resume: ${BASE_RESUME}
Job: ${j.title} at ${j.company}
JD: ${(j.description||"").slice(0,4000)}

Task: Return ONLY JSON:
{
  "tailored_summary": "2 line summary matching JD keywords for AI developer remote",
  "cover_letter": "Short 120 word cover letter showing you built AI agents that automate dev workflows",
  "matched_keywords": ["TypeScript","AI agents","RAG","MCPs","AWS"]
}
Match JD: Strong TypeScript 6+ years, Daily AI coding tools + MCPs, AWS Node React GraphQL, Shipping daily`;

      const res = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      let text = res.text || "";
      text = text.replace(/```json|```/g,"").trim();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = { tailored_summary: text.slice(0,400), cover_letter: text.slice(0,800), matched_keywords: [] }; }

      await supabase.from("jobs").update({ 
        tailored: true, 
        tailored_summary: parsed.tailored_summary,
        cover_letter: parsed.cover_letter,
        matched_keywords: parsed.matched_keywords
      }).eq("id", j.id);
      tailored++;
    } catch(e:any){ errors.push(e.message); }
  }
  return NextResponse.json({ success:true, total_in_db: total, tailored, errors, message: "Tailored for AI Developer Remote" });
}
