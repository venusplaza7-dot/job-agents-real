import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ success: false, error: 'Missing Supabase envs', envOk: false }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Mock 3 jobs for now - replace with your real API fetch later
  const jobs = [
    { title: 'Principal Product Manager, AI Platform', company: 'Scale AI', description: 'Lead AI product strategy, LLMs, Next.js, TypeScript, remote', source: 'mock', tailored: false },
    { title: 'AI Trainer - Image QA', company: 'Invisible Technologies', description: 'Train AI models, image QA, Python, attention to detail', source: 'mock', tailored: false },
    { title: 'Golang Kubernetes Engineer', company: 'Tether', description: 'Golang, Kubernetes, backend, distributed systems', source: 'mock', tailored: false },
  ]

  const { data, error } = await supabase.from('jobs').insert(jobs).select()

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 })

  return Response.json({ success: true, fetched: 3, inserted: data?.length || 0, envOk: true })
}
