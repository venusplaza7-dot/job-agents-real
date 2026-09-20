import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
 try {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
  const geminiKey = (process.env.GEMINI_API_KEY || "AQ.Ab8RN6K2hIAyxC5qicoz357viYxNYmaqkhZq7bDGYfV_RCqMXg").trim()
  const brevoKey = process.env.BREVO_API_KEY!
  const myEmail = process.env.MY_EMAIL || "ron@venushq7.com"

  // 1. FETCH - fetch 3 only for test
  const resFetch = await fetch('https://remotive.com/api/remote-jobs?search=AI%20developer', { cache: 'no-store' })
  const jsonFetch = await resFetch.json()
  let inserted = 0
  let insertErrors: any[] = []
  for (const j of (jsonFetch.jobs || []).slice(0, 3)) {
   const { data: exists } = await supabase.from('jobs').select('id').eq('external_id', j.id.toString()).maybeSingle()
   if (exists) continue
   const { error } = await supabase.from('jobs').insert({
    external_id: j.id.toString(),
    title: j.title,
    company: j.company_name,
    location: 'Remote',
    description: (j.description || '').slice(0, 5000),
    url: j.url,
    tailored: false,
    emailed: false
   })
   if (error) insertErrors.push(error.message)
   else inserted++
  }

  // 2. TAILOR - NO FILTER BUG - just get 2 latest jobs that are not tailored
  const { data: allJobs, error: selErr } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(10)
  
  const jobsToTailor = (allJobs || []).filter((j: any) => j.tailored !== true).slice(0, 2)
  
  let tailored = 0
  let tailorError = null
  for (const job of jobsToTailor) {
   try {
    const jd = (job.description || '').slice(0, 2000)
    const prompt = `Return JSON ONLY: {"keywords":["AI"],"tailored_summary":"summary for AI dev","cover_letter":"cover letter 80 words for ${job.title}"} Job: ${jd}`
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const jj = await r.json()
    if (!jj.candidates) throw new Error(JSON.stringify(jj).slice(0, 400))
    const raw = jj.candidates[0].content.parts[0].text
    const content = JSON.parse(raw.replace(/```json|```/g, '').trim())
    await supabase.from('jobs').update({
     tailored: true,
     tailored_summary: content.tailored_summary,
     cover_letter: content.cover_letter,
     matched_keywords: content.keywords
    }).eq('id', job.id)
    tailored++
   } catch (e: any) {
    tailorError = e.message
   }
  }

  // 3. EMAIL - same fix no filter
  const { data: allJobs2 } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(10)
  const jobsToEmail = (allJobs2 || []).filter((j: any) => j.tailored === true && j.emailed !== true).slice(0, 1)
  
  let emailed = 0
  for (const job of jobsToEmail) {
   await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
     sender: { email: myEmail, name: "Ron" },
     to: [{ email: myEmail }],
     bcc: [{ email: myEmail }],
     subject: `AI Dev - ${job.company} - ${job.title}`,
     htmlContent: `<h3>${job.title} at ${job.company}</h3><p><a href="${job.url}">${job.url}</a></p><p>${job.tailored_summary}</p><p>${job.cover_letter}</p>`
    })
   })
   await supabase.from('jobs').update({ emailed: true }).eq('id', job.id)
   emailed++
  }

  return Response.json({
   success: true,
   inserted,
   insertErrors,
   total_in_db: allJobs?.length || 0,
   found_to_tailor: jobsToTailor.length,
   tailored,
   emailed,
   bcc: myEmail,
   selErr: selErr?.message,
   tailorError
  })
 } catch (e: any) {
  return Response.json({ success: false, error: e.message }, { status: 500 })
 }
}
