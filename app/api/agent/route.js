export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (!url ||!key) {
    return Response.json({ success: false, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY in Vercel Env Vars" }, { status: 500 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key);

  // Test Groq only first - no email yet
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: "test groq works" }]
    })
  });
  const d = await r.json();

  return Response.json({
    success: true,
    supabase_connected: true,
    groq_works: r.ok,
    answer: d.choices?.[0]?.message?.content
  });
}
