export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url ||!key) {
    return Response.json({ success: false, error: "Missing SUPABASE_URL or KEY in Vercel" }, { status: 500 });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    // quick test
    await supabase.from('jobs').select('id').limit(1);

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: "Say OK" }]
      })
    });
    const j = await r.json();

    return Response.json({ success: true, supabase_connected: true, groq_works: r.ok, groq_reply: j.choices?.[0]?.message?.content });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
