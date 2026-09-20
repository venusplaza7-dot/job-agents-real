import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export async function GET() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const { data: jobs } = await supabase.from("jobs").select("*").eq("tailored", true).limit(5);
  return NextResponse.json({ ready_for_email: jobs?.length || 0, jobs });
}
