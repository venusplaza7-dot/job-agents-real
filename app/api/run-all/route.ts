export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const base = `${proto}://${host}`

  const results: any = {}
  try {
    const f1 = await fetch(`${base}/api/cron/fetch-jobs`); results.fetch = await f1.json()
    const f2 = await fetch(`${base}/api/parse-and-tailor`); results.tailor = await f2.json()
    const f3 = await fetch(`${base}/api/create-drafts`); results.drafts = await f3.json()
    return Response.json({ success: true, ...results })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message, ...results }, { status: 500 })
  }
}
