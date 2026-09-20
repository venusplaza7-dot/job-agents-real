import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export async function tailorJob(job: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Job: ${job.title} at ${job.company}\nDescription: ${(job.description || "").slice(0, 4000)}\nReturn ONLY JSON: {"tailored_summary": "...", "cover_letter": "...", "matched_keywords": ["kw1"]}`;
  const result = await model.generateContent(prompt);
  let text = result.response.text().replace(/```json|```/g, "").trim();
  try { return JSON.parse(text); }
  catch { return { tailored_summary: text.slice(0,500), cover_letter: text.slice(0,1000), matched_keywords: [] }; }
}
