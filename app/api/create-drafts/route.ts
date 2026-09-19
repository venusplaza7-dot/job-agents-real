import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const gmailUser = process.env.GMAIL_USER;

    if (!clientId || !clientSecret || !refreshToken || !gmailUser) {
      return Response.json({
        success: false,
        fetched: 0,
        inserted: 0,
        lastErr: 'Missing GMAIL_ env vars',
        envOk: false,
      }, { status: 500 });
    }

    // 1. Auth to Gmail
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 2. Fetch jobs from Supabase - using SERVICE_ROLE_KEY
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing SUPABASE_URL or SERVICE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: jobs, error } = await supabase.from('jobs').select('*').limit(3);
    
    if (error) throw error;
    
    const fetched = jobs?.length || 0;
    let inserted = 0;
    let lastErr = '';

    // 3. Create drafts
    for (const job of jobs || []) {
      try {
        const subject = `Application: ${job.title || 'Role'} at ${job.company || ''}`;
        const to = job.contact_email || job.email || gmailUser;
        const body = job.cover_letter || job.body || `Hi, applying for ${job.title}`;

        const rawMessage = [
          `From: ${gmailUser}`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `Content-Type: text/html; charset=utf-8`,
          `MIME-Version: 1.0`,
          ``,
          `${body}`,
        ].join('\n');

        const encoded = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await gmail.users.drafts.create({
          userId: 'me',
          requestBody: {
            message: { raw: encoded },
          },
        });
        inserted++;
      } catch (e: any) {
        lastErr = e.message;
        console.error(e);
      }
    }

    return Response.json({ success: true, fetched, inserted, lastErr, envOk: true });

  } catch (e: any) {
    return Response.json({
      success: false,
      fetched: 0,
      inserted: 0,
      lastErr: e.message,
      envOk: true,
    }, { status: 500 });
  }
}
