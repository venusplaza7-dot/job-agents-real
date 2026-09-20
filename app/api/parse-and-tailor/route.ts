import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
try {
 const supabaseUrl = process.env.SUPABASE_URL
 const serviceKey = process.env.SUPABASE_SECRET_KEY
 const geminiKey = process.env.GEMINI_API_KEY

 if (!supabaseUrl ||!serviceKey ||!geminiKey) {
  return Response.json({
   success: false,
   error: `Missing envs - URL:${!!supabaseUrl} SERVICE:${!!serviceKey} GEMINI:${!!geminiKey}`,
   hint: "Add GEMINI_API_KEY in Vercel"
  }, { status: 500 })
 }

 const supabase = createClient(supabaseUrl, serviceKey)
 const { data: jobs, error } = await supabase.from('jobs').select('*').eq('tailored', false).limit(5)

 if (error) throw error
 if (!jobs || jobs.length === 0) {
  return Response.json({ success: true, tailored: [] })
 }

 const tailored = [];

 for (const job of jobs) {
  const jd = (job.description || '').slice(0, 4000)
  const prompt = `You are Imran Afzal, 45, Full-Stack Developer in Lahore, Pakistan.
Title: ${job.title} Company: ${job.company} Description: ${jd}
Return JSON ONLY, no markdown: {"keywords": ["4-6 keywords"], "tailored_summary": "2 line summary tailored to this job", "cover_letter": "4 line cover letter"}`;

  // --- GEMINI CALL (replaces Groq) ---
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
   })
  });

  if (!res.ok) {
   const txt = await res.text()
   throw new Error(`Gemini error ${res.status}: ${txt.slice(0,200)}`)
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const content = JSON.parse(rawText);

  await supabase.from('jobs').update({
   tailored: true,
   tailored_summary: content.tailored_summary || '',
   cover_letter: content.cover_letter || '',
   matched_keywords: content.keywords || [],
   updated_at: new Date().toISOString()
  }).eq('id', job.id);

  tailored.push({
   id: job.id,
   title: job.title,
   company: job.company,
  ...content
  });
 }

 return Response.json({ success: true, tailored, count: tailored.length })
} catch (e: any) {
 return Response.json({ success: false, error: e.message }, { status: 500 })
}
}
