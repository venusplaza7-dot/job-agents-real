import { ImapFlow } from 'imapflow';

export async function GET() {
  try {
    const gmailUser = process.env.USER_EMAIL;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return Response.json({ success: false, error: 'Missing env USER_EMAIL / GMAIL_APP_PASSWORD' }, { status: 500 });
    }

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
      logger: false
    });

    await client.connect();

    // DEBUG: find the correct drafts path
    // const boxes = await client.list();
    // console.log(boxes.map(b => b.path));

    let draftFolder = '[Gmail]/Drafts';
    try {
      await client.mailboxOpen(draftFolder);
    } catch {
      draftFolder = '[Google Mail]/Drafts'; // UK / other locales
    }
    await client.mailboxClose();

    const jobs = [{ title: 'Test 1', company: 'Test Co' }];

    for (const j of jobs) {
      const raw = [
        `From: ${gmailUser}`,
        `To: ${gmailUser}`,
        `Subject: Application - ${j.title} at ${j.company}`,
        `Date: ${new Date().toUTCString()}`,
        `Content-Type: text/plain; charset=utf-8`,
        `X-Unsent: 1`,
        ``,
        `Hello, this is a draft for ${j.title}`,
        ``
      ].join('\r\n');

      await client.append(draftFolder, raw, { flags: ['\\Draft'] });
    }

    await client.logout();
    return Response.json({ success: true, count: jobs.length, folder: draftFolder });

  } catch (e: any) {
    console.error('IMAP FULL ERROR:', e);
    return Response.json({ success: false, error: 'IMAP Error: Command failed', detail: e.message, stack: e.stack }, { status: 500 });
  }
}
