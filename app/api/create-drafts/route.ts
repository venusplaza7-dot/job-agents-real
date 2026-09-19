export const runtime = 'nodejs';

import { ImapFlow } from 'imapflow';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL! as string,
      process.env.SUPABASE_ANON_KEY! as string
    );

    const { data: jobs } = await supabase.from('jobs').select('*').limit(3);

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER! as string,
        pass: process.env.GMAIL_APP_PASSWORD! as string,
      }
    });

    await client.connect();
    let count = 0;
    for (const job of jobs || []) {
      const raw = `From: ${process.env.GMAIL_USER}\r\nTo: ${process.env.GMAIL_USER}\r\nSubject: Draft - ${job?.title || 'Job'}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<p>Draft for ${job?.title} at ${job?.company}</p>`;
      await client.append('[Gmail]/Drafts', raw);
      count++;
    }
    await client.logout();

    return Response.json({ success: true, drafts_created: count });
  } catch (e: any) {
    return Response.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
