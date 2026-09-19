import { ImapFlow } from 'imapflow';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gmailUser = process.env.USER_EMAIL;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser ||!gmailPass) {
    return Response.json({ success: false, error: 'Missing env' }, { status: 500 });
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    logger: false
  });

  try {
    await client.connect();

    // Gmail drafts folder - try both locales
    let draftFolder = '[Gmail]/Drafts';
    try {
      await client.mailboxOpen(draftFolder);
      await client.mailboxClose();
    } catch {
      draftFolder = '[Google Mail]/Drafts';
    }

    const raw = `From: ${gmailUser}\r\nTo: ${gmailUser}\r\nSubject: Test draft\r\nDate: ${new Date().toUTCString()}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nTest body`;

    await client.append(draftFolder, raw);

    await client.logout();
    return Response.json({ success: true, folder: draftFolder });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
