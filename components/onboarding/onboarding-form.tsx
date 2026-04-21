"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Video, GraduationCap, FileText, Mic, ArrowRight, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const resourceTypes = [
  { id: "videos", label: "Videos", icon: Video },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "podcasts", label: "Podcasts", icon: Mic },
];

export function OnboardingForm() {
  const router = useRouter();
  const [skill, setSkill] = useState("");
  const [selected, setSelected] = useState<string[]>(["videos"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleResource(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!skill.trim()) {
      setError("Please enter a skill or hobby.");
      return;
    }
    if (selected.length === 0) {
      setError("Please select at least one resource type.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Save in background — don't block navigation on DB errors
    supabase.from("profiles").upsert(
      { id: user.id, goals: skill, availability: { resource_types: selected } },
      { onConflict: "id" }
    ).then(({ error }) => { if (error) console.error("Profile save error:", error); });

    router.push(`/schedule?skill=${encodeURIComponent(skill)}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Heading */}
        <h1 className="text-center font-bold leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
          <span className="text-gray-900">What would you like to</span>
          <br />
          <span className="text-gray-300">master today?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-400 text-base mb-12 max-w-lg mx-auto leading-relaxed">
          Input any skill or hobby, and our AI will build a personalized
          curriculum tailored to your schedule and preferences.
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Skill input */}
          <div>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g., Python Programming, Guitar, Photography..."
              className="w-full text-lg text-gray-500 placeholder-gray-300 bg-transparent border-0 border-b border-gray-200 focus:outline-none focus:border-gray-400 pb-3 transition-colors"
            />
          </div>

          {/* Resource types */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Preferred Resource Types
              </span>
              <span className="text-xs text-gray-300">Select all that apply</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {resourceTypes.map(({ id, label, icon: Icon }) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleResource(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-medium transition-all border ${
                      active
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base rounded-2xl px-10 py-5 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Next"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
            <p className="flex items-center gap-1.5 text-xs text-gray-300">
              <CalendarDays size={13} />
              Next: We'll sync with your calendar to find the best study times
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
