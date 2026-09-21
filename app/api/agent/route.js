export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json({ ok: true, groq: !!process.env.GROQ_API_KEY, supabase: !!process.env.SUPABASE_URL });
}
