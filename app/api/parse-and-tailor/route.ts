import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
    const openaiKey = process.env.OPENAI_API_KEY!;

    if (!supabaseUrl ||!serviceKey ||!openaiKey) {
      return Response.json({ success: false, error: 'Missing envs' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: jobs } = await supabase.from('jobs').select('*').eq('tailored', false).limit(10);

    if (!jobs || jobs.length === 0) {
      return Response.json({ success: true, tailored: [], message: 'No jobs to tailor' });
    }

    const tailored = [];

    for (const job of jobs) {
      const jd = (job.description || '').slice(0, 4000);

      const prompt = `You are Imran Afzal, 45, Full-Stack AI Agent Engineer (Lahore, Remote EST overlap).

My 15 repos & proof:
- venus-ai-v7: open-source 8-agent workflow (Scout, Filter, Dedup, Personalize, Send, Inbox Check, CRM, Scale) - 100 domains/day/city, 50 cities
- venus-ai-v8: live prod venus-ai-v8.vercel.app/toyota-of-denver?niche=auto - books on WhatsApp, Missed-call AI, Twilio, Stripe, BCC-proof audit, Supabase traces/evals, Upstash KV lock fixed double-send 8%->0% at 1:01/1:30 AM, 95% filter accuracy, offline/online scoring
- venus-outreach, venus-ai-voice, orbital-highway, rsi-monitor, job-agents-real (this), etc.
- Stack: Next.js 14 App Router, React, TypeScript, Node, Python FastAPI,.NET Core, Postgres, DynamoDB, GraphQL, Redis, Upstash KV, Vercel, Supabase, Brevo, Tailwind, OpenAI GPT-4o/Vision/GPT-4o-mini, LangChain patterns

Job to tailor for:
Title: ${job.title}
Company: ${job.company}
Description: ${jd}

Task:
1. Extract 4-6 keywords from JD that match my stack (e.g. React, Next.js, Supabase, Vercel, AI, LLM, TypeScript, EST overlap)
2. Write tailored_summary: 2 lines max, start with "Full-Stack AI Developer with 8-agent engine live in 50 cities..." + include EST overlap + hit JD keywords + live link
3. Write cover_letter: 130 words max, human, not robotic, warm. Structure: Greeting, what I built that matches their need, live proof link, close with CTA. Include: github.com/venusplaza7-dot/venus-ai-v7, venus-ai-v8.vercel.app/toyota-of-denver?niche=auto, WhatsApp wa.me/923217973545, email Venusplaza7@gmail.com, phone +92 321 797 3545, availability Remote EST overlap.

Return JSON only: {"keywords":[],"tailored_summary":"","cover_letter":""}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      const json = await res.json();
      const content = JSON.parse(json.choices?.[0]?.message?.content || '{}');

      // Update job in Supabase
      await supabase.from('jobs').update({
        tailored: true,
        tailored_summary: content.tailored_summary || `Full-Stack AI Developer with 8-agent engine live in 50 cities, 100/day/city. EST overlap.`,
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

    return Response.json({ success: true, tailored });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
