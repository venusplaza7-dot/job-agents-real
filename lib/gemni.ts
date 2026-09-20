import { GoogleGenAI } from "@google/genai";

export function getGemini() {
  const key = process.env.GEMINI_API_KEY!;
  return new GoogleGenAI({ apiKey: key });
}

export async function generateTailoredResume(prompt: string) {
  const ai = getGemini();
  const result = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt
  });
  return result.text;
}
