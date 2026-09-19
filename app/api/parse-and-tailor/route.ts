import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_KEY!
    const groqKey = process.env.GROQ_API_KEY!

    if (!supabaseUrl ||!serviceKey ||!groqKey) {
      return Response.json({ success: false, error: `Missing envs - GROQ_API_KEY present? ${!!groqKey}` }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: jobs } = await supabase.from('jobs').select('*').eq('tailored', false).limit(3)

    if (!jobs || jobs.length === 0) {
      return Response.json({ success: true, tailored: [], message: 'No untailored jobs' })
    }

    const tailored = [];

    for (const job of jobs) {
      const jd = (job.description || '').slice(0, 4000)
      const prompt = `You are Imran Afzal, 45, Full-Stack AI Engineer, Lahore. Founder of Venus AI. 15 repos proof: venus-ai-v7, v8, etc. Stack: Next.js 14, TypeScript, etc.

Job to tailor for: Title: ${job.title} Company: ${job.company} Description: ${jd}

Task:
1. Extract 4-6 keywords
2. Write tailored_summary: 2 lines max
3. Write cover_letter: 130 words max, human

Return JSON only: {"keywords":[],"tailored_summary":"","cover_letter":""}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      const json = await res.json();
      const content = JSON.parse(json.choices?.[0]?.message?.content || '{}');

      await supabase.from('jobs').update({
        tailored: true,
        tailored_summary: content.tailored_summary,
        cover_letter: content.cover_letter || '',
        matched_keywords: content.keywords || [],
        updated_at: new Date().toISOString()
      }).eq('id', job.id);

      tailored.push({
        id: job.id,
        title: job.title,
        company: job.company,
        tailored_summary: content.tailored_summary,
        matched_keywords: content.keywords,
        cover_letter: content.cover_letter
      });
    }

    return Response.json({ success: true, tailored })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
