"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export type SkillRow = { id: string; title: string; description: string | null };

export function SkillPicker({ skills }: { skills: SkillRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectSkill(skillId: string) {
    setError(null);
    setPendingId(skillId);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { error: upError } = await supabase.from("profiles").update({ active_skill_id: skillId }).eq("id", user.id);
      if (upError) {
        setError(upError.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-lg">{s.title}</CardTitle>
              {s.description ? <CardDescription>{s.description}</CardDescription> : null}
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={pendingId !== null} onClick={() => selectSkill(s.id)}>
                {pendingId === s.id ? "Saving…" : "Choose this skill"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
