import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
 try {
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SECRET_KEY!
  const supabase = createClient(supabaseUrl, serviceKey)

  // Real Remote Jobs API - No key needed, searches AI developer
  const res = await fetch('https://remotive.com/api/remote-jobs?search=AI%20developer', { cache: 'no-store' })
  const json = await res.json()
  const apiJobs = json.jobs || []

  let inserted = 0
  for (const j of apiJobs.slice(0, 15)) {
   const { data: exists } = await supabase.from('jobs').select('id').eq('external_id', j.id.toString()).maybeSingle()
   if (exists) continue

   await supabase.from('jobs').insert({
    external_id: j.id.toString(),
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || 'Remote',
    description: j.description,
    url: j.url,
    tailored: false,
    emailed: false
   })
   inserted++
  }

  return Response.json({ success: true, found: apiJobs.length, inserted })
 } catch (e: any) {
  return Response.json({ success: false, error: e.message }, { status: 500 })
 }
}
