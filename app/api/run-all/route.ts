import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
 try {
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SECRET_KEY!
  const geminiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6K2hIAyxC5qicoz357viYxNYmaqkhZq7bDGYfV_RCqMXg"
  const brevoKey = process.env.BREVO_API_KEY!
  const myEmail = process.env.MY_EMAIL! || "ron@venushq7.com"
  const supabase = createClient(supabaseUrl, serviceKey)

  // STEP 1: FETCH
  const resFetch = await fetch('https://remotive.com/api/remote-jobs?search=AI%20developer', { cache: 'no-store' })
  const jsonFetch = await resFetch.json()
  let inserted = 0
  for (const j of (jsonFetch.jobs || []).slice(0, 10)) {
   const { data: exists } = await supabase.from('jobs').select('id').eq('external_id', j.id.toString()).maybeSingle()
   if (exists) continue
   await supabase.from('jobs').insert({
    external_id: j.id.toString(),
    title: j.title, company: j.company_name,
    location: 'Remote', description: j.description,
    url: j.url, tailored: false, emailed: false
   })
   inserted++
  }

  // STEP 2: TAILOR - FIX: include null + false
  const { data: jobsToTailor } = await supabase.from('jobs').select('*').or('tailored.is.null,tailored.eq.false').limit(2)
  let tailoredCount = 0
  let tailorError = null
  if (jobsToTailor && jobsToTailor.length > 0) {
   for (const job of jobsToTailor) {
    try {
     const jd = (job.description || '').slice(0, 3000)
     const prompt = `Return JSON ONLY: {"keywords":["AI"],"tailored_summary":"Summary for ${job.title}","cover_letter":"Cover letter 100 words"} Job: ${job.title} - ${jd}`;
     const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
     })
     const j = await res.json()
     if (!j.candidates) throw new Error(JSON.stringify(j).slice(0,500))
     const raw = j.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
     const clean = raw.replace(/```json|```/g,'').trim()
     const content = JSON.parse(clean)
     await supabase.from('jobs').update({
      tailored: true, tailored_summary: content.tailored_summary,
      cover_letter: content.cover_letter, matched_keywords: content.keywords,
     }).eq('id', job.id)
     tailoredCount++
    } catch (e:any) { tailorError = e.message }
   }
  }

  // STEP 3: SEND with BCC
  const { data: jobsToEmail } = await supabase.from('jobs').select('*').eq('tailored', true).or('emailed.is.null,emailed.eq.false').limit(2)
  let emailed = 0
  if (jobsToEmail && jobsToEmail.length > 0) {
   for (const job of jobsToEmail) {
    await fetch('https://api.brevo.com/v3/smtp/email', {
     method: 'POST',
     headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
     body: JSON.stringify({
      sender: { email: myEmail, name: "Ron - AI Developer" },
      to: [{ email: myEmail }],
      bcc: [{ email: myEmail }],
      subject: `${job.company} - ${job.title}`,
      htmlContent: `<h3>${job.title} at ${job.company}</h3><p>${job.url}</p><p>${job.tailored_summary}</p><p>${job.cover_letter}</p>`
     })
    })
    await supabase.from('jobs').update({ emailed: true }).eq('id', job.id)
    emailed++
   }
  }

  return Response.json({ success: true, inserted, found_to_tailor: jobsToTailor?.length || 0, tailored: tailoredCount, emailed, bcc: myEmail, error: tailorError })
 } catch (e: any) {
  return Response.json({ success: false, error: e.message }, { status: 500 })
 }
}
