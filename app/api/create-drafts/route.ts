export const runtime = 'nodejs';
import { ImapFlow } from 'imapflow';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const gmailUser = process.env.GMAIL_USER || process.env.USER_EMAIL;
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASS || '').replace(/\s/g, '');

    if (!supabaseUrl) return Response.json({ success: false, error: `SUPABASE_URL is empty in Vercel. Tap it to check value. Found: ${Object.keys(process.env).filter(k=>k.includes('SUPABASE'))}` }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey!);
    const { data: jobs } = await supabase.from('jobs').select('*').limit(3);

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: gmailUser!, pass: gmailPass }
    });

    await client.connect();
    let count = 0;
    for (const j of jobs || []) {
      const raw = `From: ${gmailUser}\r\nTo: ${gmailUser}\r\nSubject: Draft - ${j.title}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<p>Draft for ${j.title} at ${j.company}</p>`;
      await client.append('Drafts', raw);
      count++;
    }
    await client.logout();
    return Response.json({ success: true, drafts_created: count, using: gmailUser });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
