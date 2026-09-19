import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
    const gmailUser = process.env.GMAIL_USER!
    const clientId = process.env.GMAIL_CLIENT_ID!
    const clientSecret = process.env.GMAIL_CLIENT_SECRET!
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN!

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: jobs } = await supabase.from('jobs').select('*').eq('tailored', true).eq('draft_created', false).limit(3)

    if (!jobs || jobs.length === 0) {
      return Response.json({ success: true, message: 'No tailored jobs to draft', drafts: 0 })
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret)
    oAuth2Client.setCredentials({ refresh_token: refreshToken })
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })

    let count = 0
    for (const job of jobs) {
      const subject = `Application for ${job.title} at ${job.company} - Imran Afzal`
      const body = `${job.cover_letter || job.tailored_summary || ''}

---
Imran Afzal | Full-Stack AI Engineer | Founder Venus AI
Lahore, Pakistan | 15+ Production AI Repos
Portfolio: venusplaza7.com

Job: ${job.title} at ${job.company}`

      const raw = Buffer.from(
        `To: ${gmailUser}\r\nBcc: venusailux@gmail.com\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      await gmail.users.drafts.create({ userId: 'me', requestBody: { message: { raw } } })
      await supabase.from('jobs').update({ draft_created: true }).eq('id', job.id)
      count++
    }

    return Response.json({ success: true, drafts: count })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
