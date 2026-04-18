import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  if (profile?.full_name?.trim()) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
