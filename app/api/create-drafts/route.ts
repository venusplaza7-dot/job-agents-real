import { ImapFlow } from 'imapflow';

export const dynamic = 'force-dynamic';

export async function GET() {
  const gmailUser = process.env.USER_EMAIL;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!gmailUser ||!gmailPass) {
    return Response.json({
      success: false,
      fetched: 0,
      inserted: 0,
      lastErr: 'Missing USER_EMAIL or GMAIL_APP_PASSWORD',
      envOk: false
    }, { status: 500 });
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
    logger: false,
  });

  let fetched = 0;
  let inserted = 0;
  let lastErr = '';

  try {
    await client.connect();

    // Find correct Drafts folder for your Gmail language
    let draftFolder = '[Gmail]/Drafts';
    try {
      await client.mailboxOpen(draftFolder);
      await client.mailboxClose();
    } catch {
      draftFolder = '[Google Mail]/Drafts';
      await client.mailboxOpen(draftFolder);
      await client.mailboxClose();
    }

    // --- Replace this with your Supabase fetch ---
    // Example: fetch from Supabase table "jobs"
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(supabaseUrl!, supabaseKey!);
    // const { data: jobs } = await supabase.from('jobs').select('*').limit(3);

    // Mock data to match your screenshot that returned 3
    const jobs = [
      { title: 'Software Engineer', company: 'Figure AI', email: 'brett@figure.ai', body: 'Hi Brett Adcock, saw Figure...' },
      { title: 'Frontend Dev', company: 'Venus Inc', email: 'hiring@venus.com', body: 'Hi, I am Venus, 15-per-hour...' },
      { title: 'Next.js Dev', company: 'Hunt', email: 'hunt@example.com', body: 'Hello, I am interested in Hunt role...' },
    ];

    fetched = jobs.length;

    for (const job of jobs) {
      try {
        const subject = `Application: ${job.title} at ${job.company}`;
        const to = job.email;
        const now = new Date();

        // This raw format fixes (no subject) and date issue
        const raw = [
          `From: ${gmailUser}`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `Date: ${now.toUTCString()}`,
          `Content-Type: text/html; charset=utf-8`,
          `MIME-Version: 1.0`,
          `X-Unsent: 1`,
          `Message-ID: <${now.getTime()}@job-agents>`,
          ``,
          `<div>${job.body}<br><br>Regards,<br>Venus</div>`,
          ``,
        ].join('\r\n');

        await client.append(draftFolder, raw, {
          internalDate: now,
        } as any);

        inserted++;
      } catch (e: any) {
        lastErr = e.message;
        console.error('Failed job', job, e);
      }
    }

    await client.logout();

    return Response.json({
      success: true,
      fetched,
      inserted,
      lastErr,
      envOk: true,
    });

  } catch (e: any) {
    try { await client.logout(); } catch {}
    return Response.json({
      success: false,
      fetched,
      inserted,
      lastErr: e.message,
      envOk: true,
    }, { status: 500 });
  }
}
