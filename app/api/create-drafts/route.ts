import { ImapFlow } from 'imapflow';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  // 1. Get jobs from Supabase that don't have draft yet
  const { data: jobs } = await supabase.from('jobs').select('*').limit(3);

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER, // venusplaza7@gmail.com
      pass: process.env.GMAIL_APP_PASSWORD, // gblqhhbcnhhytjtl without spaces
    }
  });

  await client.connect();
  let count = 0;

  for (const job of jobs) {
    const emailBody = `From: ${process.env.GMAIL_USER}\r\n` +
      `To: ${process.env.GMAIL_USER}\r\n` +
      `Subject: Application Draft - ${job.title || 'Job'}\r\n` +
      `Content-Type: text/html; charset=utf-8\r\n\r\n` +
      `<p>Hi Hiring Manager,</p><p>Draft for ${job.company} - ${job.title}</p>`;

    await client.append('[Gmail]/Drafts', emailBody);
    count++;
  }

  await client.logout();
  return Response.json({ success: true, drafts_created: count });
}
