import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  try {
    const res = await fetch("https://remoteok.com/api?tag=ai", { headers: { "User-Agent": "job-agents-real" } });
    const jobs = await res.json();
    let inserted = 0;
    for (const job of jobs.slice(1, 11)) { // first is legal text
      if (!job.position) continue;
      const { error } = await supabase.from("jobs").upsert({
        id: job.id?.toString(),
        title: job.position,
        company: job.company,
        description: (job.description||"").slice(0,5000),
        url: job.url,
        source: "remoteok",
        tailored: false,
        emailed: false
      }, { onConflict: 'id' });
      if (!error) inserted++;
    }
    return NextResponse.json({ success: true, fetched: jobs.length-1, inserted });
  } catch(e:any){
    return NextResponse.json({ success:false, error:e.message }, { status:500 });
  }
}
