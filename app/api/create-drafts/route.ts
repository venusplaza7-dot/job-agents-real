export const runtime = 'nodejs';
import { ImapFlow } from 'imapflow';

export async function GET() {
  try {
    const gmailUser = (process.env.USER_EMAIL || process.env.GMAIL_USER || '').trim();
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASS || '').replace(/\s/g, '');

    if (!gmailPass) return Response.json({ success: false, error: 'GMAIL_APP_PASSWORD blank' });
    
    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
      logger: false
    });

    await client.connect();
    
    const jobs = [{title:'Test 1', company:'Google'}, {title:'Test 2', company:'Amazon'}];
    let count = 0;
    for (const j of jobs) {
      const raw = `From: ${gmailUser}\r\nTo: ${gmailUser}\r\nSubject: Draft - ${j.title}\r\nContent-Type: text/html; charset=utf-8\r\n\r\nTest ${j.title}`;
      await client.append('Drafts', raw);
      count++;
    }
    await client.logout();
    return Response.json({ success: true, drafts_created: count, user: gmailUser });
  } catch (e: any) {
    return Response.json({ success: false, error: `IMAP Error: ${e.message}`, detail: String(e) }, { status: 500 });
  }
}
