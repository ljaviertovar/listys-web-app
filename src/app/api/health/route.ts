import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {
    api: "ok",
    database: "ok",
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("groups").select("id").limit(1);
    if (error) checks.database = "error";
  } catch {
    checks.database = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status }
  );
}
