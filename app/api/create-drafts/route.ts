import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const { data: jobs } = await supabase.from("jobs").select("*").eq("tailored", true).eq("emailed", false).limit(5);
  let emailed = 0;
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  for (const job of jobs || []) {
    if (resend) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: [process.env.TO_EMAIL || "ron@venushq7.com"],
        bcc: [process.env.BCC_EMAIL || "ron@venushq7.com"],
        subject: `Tailored: ${job.title}`,
        html: `<p>${job.tailored_summary}</p>`
      });
    }
    await supabase.from("jobs").update({ emailed: true }).eq("id", job.id);
    emailed++;
  }
  return NextResponse.json({ emailed });
}
