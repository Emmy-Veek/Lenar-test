import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  taskId: z.string().uuid(),
  submission: z.string().min(1).max(20000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, submission } = parsed.data;

  const { data: row, error: findError } = await supabase
    .from("user_tasks")
    .select("id")
    .eq("user_id", user.id)
    .eq("task_id", taskId)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Task not assigned" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("user_tasks")
    .update({ submission, completed: true })
    .eq("id", row.id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
