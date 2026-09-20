import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
 try {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY
  const geminiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6K2hIAyxC5qicoz357viYxNYmaqkhZq7bDGYfV_RCqMXg"

  if (!supabaseUrl ||!serviceKey ||!geminiKey) {
   return Response.json({
    success: false,
    error: `Missing envs - URL:${!!supabaseUrl} SERVICE:${!!serviceKey} GEMINI:${!!geminiKey}`,
   }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data: jobs } = await supabase.from('jobs').select('*').eq('tailored', false).limit(2)

  if (!jobs || jobs.length === 0) {
   return Response.json({ success: true, tailored: [], message: "No untailored jobs" })
  }

  const tailored = [];
  for (const job of jobs) {
   const jd = (job.description || '').slice(0, 3000)
   const prompt = `Return JSON ONLY: {"keywords":["js"],"tailored_summary":"summary for ${job.title}","cover_letter":"cover letter"} Job: ${job.title} at ${job.company} - ${jd}`;

   const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
   });

   const json = await res.json();
   if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${JSON.stringify(json).slice(0,300)}`)

   const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
   const clean = rawText.replace(/```json|```/g,'').trim()
   const content = JSON.parse(clean);

   await supabase.from('jobs').update({
    tailored: true,
    tailored_summary: content.tailored_summary,
    cover_letter: content.cover_letter,
    matched_keywords: content.keywords,
    updated_at: new Date().toISOString()
   }).eq('id', job.id);

   tailored.push({ id: job.id, title: job.title,...content });
  }

  return Response.json({ success: true, tailored, count: tailored.length })
 } catch (e: any) {
  return Response.json({ success: false, error: e.message }, { status: 500 })
 }
}
