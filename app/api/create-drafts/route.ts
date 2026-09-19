export const runtime = 'nodejs';
import { ImapFlow } from 'imapflow';

export async function GET() {
  try {
    const gmailUser = process.env.USER_EMAIL || process.env.GMAIL_USER;
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASS || '').replace(/\s/g, '');

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: gmailUser!, pass: gmailPass }
    });

    await client.connect();
    const jobs = [{title:'Test Job 1', company:'Google'}, {title:'Test Job 2', company:'Amazon'}, {title:'Test Job 3', company:'Microsoft'}];
    let count = 0;
    for (const j of jobs) {
      const raw = `From: ${gmailUser}\r\nTo: ${gmailUser}\r\nSubject: Draft - ${j.title}\r\nContent-Type: text/html\r\n\r\n<p>Draft for ${j.title}</p>`;
      await client.append('Drafts', raw);
      count++;
    }
    await client.logout();
    return Response.json({ success: true, drafts_created: count });
  } catch (e:any) { return Response.json({ success:false, error:e.message }, {status:500}); }
}
