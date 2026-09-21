import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

  // 1. Get 1 job not applied
  const { data: jobs } = await supabase.from('jobs').select('*').eq('applied', false).limit(1)
  if (!jobs?.length) return Response.json({ success: true, msg: "No jobs left" })
  const job = jobs[0]

  // 2. Groq - your working model
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "You are AI Developer Ron Kahn from Lahore, 10+ years. Write short cover letter." },
        { role: "user", content: `Job: ${job.title} at ${job.company} - ${job.description}` }
      ]
    })
  })
  const groqData = await groqRes.json()
  const coverLetter = groqData.choices?.[0]?.message?.content

  // 3. Send email via Resend
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Ron Kahn <jobs@yourdomain.com>",
      to: job.email,
      subject: `Application for ${job.title}`,
      html: `<p>${coverLetter}</p>`
    })
  })

  // 4. Mark applied
  await supabase.from('jobs').update({ applied: true }).eq('id', job.id)

  return Response.json({ success: true, applied_to: job.company, letter: coverLetter })
}
