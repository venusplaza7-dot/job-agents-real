import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
 try {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
  const brevoKey = process.env.BREVO_API_KEY!
  const myEmail = process.env.MY_EMAIL! || "ron@venushq7.com"

  const { data: jobs } = await supabase.from('jobs').select('*').eq('tailored', true).eq('emailed', false).limit(3)
  if (!jobs || jobs.length === 0) {
   return Response.json({ success: true, message: "No tailored jobs to email", emailed: 0 })
  }

  for (const job of jobs) {
   await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
     sender: { email: myEmail, name: "Ron - AI Developer" },
     to: [{ email: myEmail }], // TEST: sends to you. Later change to job email
     bcc: [{ email: myEmail }], // BCC you - like your roofing campaign
     subject: `${job.company} - AI Developer - ${job.title}`,
     htmlContent: `<h3>${job.title} at ${job.company}</h3>
     <p>Job: <a href="${job.url}">${job.url}</a></p>
     <p><b>Keywords:</b> ${job.matched_keywords?.join(', ')}</p>
     <hr/><p>${job.tailored_summary}</p>
     <p style="white-space:pre-wrap">${job.cover_letter}</p>`
    })
   })
   await supabase.from('jobs').update({ emailed: true }).eq('id', job.id)
  }
  return Response.json({ success: true, emailed: jobs.length })
 } catch (e: any) {
  return Response.json({ success: false, error: e.message }, { status: 500 })
 }
}
