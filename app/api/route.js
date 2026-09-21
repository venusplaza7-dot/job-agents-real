export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const hasGroq =!!process.env.GROQ_API_KEY;
    const hasSupabase =!!process.env.SUPABASE_URL;

    if (!hasGroq) return Response.json({ success: false, error: "Missing GROQ_API_KEY in Vercel Env" }, { status: 500 });

    // Test Groq openai/gpt-oss-20b
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: "Say OK if working" }]
      })
    });
    const data = await r.json();

    return Response.json({
      success: true,
      supabase_connected: hasSupabase,
      groq_works: r.ok,
      groq_response: data.choices?.[0]?.message?.content || data
    });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
