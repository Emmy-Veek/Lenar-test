import { redirect } from "next/navigation";

import { SkillPicker } from "@/components/skills/skill-picker";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export default async function SkillsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("goals").eq("id", user.id).maybeSingle();
  if (!profile?.goals?.trim()) {
    redirect("/onboarding");
  }

  const { data: skills, error } = await supabase.from("skills").select("id,title,description").order("title");
  if (error) {
    return <p className="text-sm text-destructive">Could not load skills: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pick a skill</h1>
        <p className="text-sm text-muted-foreground">You can change this later. We will generate your first learning path next.</p>
      </div>
      <SkillPicker skills={skills ?? []} />
    </div>
  );
}
