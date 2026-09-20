export const dynamic = 'force-dynamic';
export async function GET() {
 const base = `https://${process.env.VERCEL_URL || 'job-agents-real.vercel.app'}`
 const results: any = {}
 for (const path of ['/api/cron/fetch-jobs','/api/parse-and-tailor','/api/cron/send-emails']) {
  try {
   const r = await fetch(base + path, { cache: 'no-store' })
   results[path] = await r.json()
  } catch (e: any) { results[path] = { error: e.message } }
 }
 return Response.json({ success: true, results })
}
