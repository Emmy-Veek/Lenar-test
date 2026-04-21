"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Layers, Video, BookOpen, ChevronRight, CalendarRange, Loader2, X, Timer, CalendarCheck2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FREQ_OPTIONS = [
  { label: "1 Day", max: 1 },
  { label: "2 Days", max: 2 },
  { label: "3 Days", max: 3 },
  { label: "4 Days", max: 4 },
  { label: "5 Days", max: 5 },
  { label: "Daily", max: 7 },
];

type Lesson = {
  id: string;
  title: string;
  content_type: string;
  order_index: number;
  completed: boolean;
};

type CurriculumData = {
  skillTitle: string;
  lessons: Lesson[];
};

function ScheduleModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [frequency, setFrequency] = useState(FREQ_OPTIONS[2]);
  const [duration, setDuration] = useState(45);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 2, 4]);
  const [saving, setSaving] = useState(false);

  function toggleDay(idx: number) {
    if (selectedDays.includes(idx)) {
      setSelectedDays((prev) => prev.filter((d) => d !== idx));
    } else if (selectedDays.length < frequency.max) {
      setSelectedDays((prev) => [...prev, idx]);
    }
  }

  const hoursPerWeek = ((selectedDays.length * duration) / 60).toFixed(1);

  async function handleConfirm() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("availability").eq("id", user.id).maybeSingle();
      await supabase.from("profiles").upsert(
        { id: user.id, availability: { ...(profile?.availability as object ?? {}), frequency: frequency.label, duration, days: selectedDays.map((i) => DAY_LABELS[i]) } },
        { onConflict: "id" }
      );
    }
    onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto px-6 pt-6 pb-10 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-end mb-6">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter mb-2" style={{ fontFamily: "'General Sans', sans-serif" }}>
            Design your <span className="text-zinc-400">learning rhythm.</span>
          </h2>
          <p className="text-zinc-500 text-sm">Tell us how much time you can realistically commit each week.</p>
        </div>
        <div className="space-y-10 max-w-2xl mx-auto">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block mb-4">Weekly Frequency</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {FREQ_OPTIONS.map((opt) => (
                <button key={opt.label} type="button"
                  onClick={() => { setFrequency(opt); setSelectedDays((prev) => prev.slice(0, opt.max)); }}
                  className={`flex items-center justify-center py-3 rounded-xl border transition-all font-medium text-sm ${frequency.label === opt.label ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:border-zinc-400 text-zinc-700"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block mb-4">Session Duration</label>
            <div className="flex items-center gap-6 px-4 py-8 bg-zinc-50 rounded-2xl">
              <Timer size={24} className="text-zinc-400 shrink-0" />
              <input type="range" min={15} max={120} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="flex-1 accent-zinc-900" />
              <div className="text-right min-w-[80px]">
                <span className="text-2xl font-semibold">{duration}</span>
                <span className="text-zinc-400 font-medium ml-1">min</span>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block mb-1">Select Preferred Days</label>
              <p className="text-xs text-zinc-400 mb-4">Select up to <span className="font-semibold text-zinc-600">{frequency.max}</span> day{frequency.max !== 1 ? "s" : ""} ({selectedDays.length}/{frequency.max} chosen)</p>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, idx) => {
                  const isSelected = selectedDays.includes(idx);
                  const isDisabled = !isSelected && selectedDays.length >= frequency.max;
                  return (
                    <button key={idx} type="button" onClick={() => toggleDay(idx)} disabled={isDisabled}
                      className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all ${isSelected ? "bg-zinc-900 text-white border-zinc-900" : isDisabled ? "border-zinc-100 text-zinc-300 cursor-not-allowed" : "border-zinc-200 hover:border-zinc-400 text-zinc-700"}`}
                    >
                      <span className="text-xs font-semibold">{day}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-3 mb-4">
                <CalendarCheck2 size={16} className="text-zinc-900" />
                <span className="text-sm font-semibold">Weekly Forecast</span>
              </div>
              <div className="flex gap-1 h-12 items-end">
                {DAYS.map((_, idx) => (
                  <div key={idx} className={`flex-1 rounded-t-lg transition-all ${selectedDays.includes(idx) ? "bg-zinc-900 h-full" : "bg-zinc-200 h-1/4"}`} />
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
                Your curriculum will be paced for <span className="font-semibold text-zinc-600">{hoursPerWeek} hours/week</span> across {selectedDays.length} day{selectedDays.length !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
          <div>
            <button onClick={handleConfirm} disabled={saving || selectedDays.length === 0}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-zinc-900 text-white rounded-2xl font-semibold text-lg hover:bg-zinc-800 transition-all disabled:opacity-60"
            >
              <span>{saving ? "Saving…" : "Confirm & View Dashboard"}</span>
              <CheckCircle size={20} />
            </button>
            <button type="button" onClick={onClose} className="w-full mt-4 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors">
              Skip for now, use default schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  const router = useRouter();
  const [data, setData] = useState<CurriculumData | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/curriculum/generate", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setErrorMsg(d.error);
          setLoading(false);
          return;
        }
        setData(d);
        setLoading(false);
      })
      .catch((e) => { setErrorMsg(String(e)); setLoading(false); });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-400 tracking-wide">Building your personalized curriculum…</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-semibold text-red-500">Error: {errorMsg}</p>
        <button onClick={() => router.push("/onboarding")} className="text-sm text-zinc-500 underline">
          Go back to onboarding
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { skillTitle, lessons } = data;
  const videoCount = lessons.filter((l) => l.content_type === "video").length;
  const videoPct = lessons.length ? Math.round((videoCount / lessons.length) * 100) : 0;
  const otherPct = 100 - videoPct;
  const totalHours = lessons.length * 3;
  const weeksTotal = Math.max(1, Math.ceil(lessons.length / 2));

  return (
    <div className="min-h-screen bg-white text-zinc-900" style={{ fontFamily: "'Satoshi', sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20">

        {/* Hero */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4 block">
                Your Personalized Path
              </span>
              <h1
                className="text-5xl md:text-6xl font-semibold tracking-tighter mb-4"
                style={{ fontFamily: "'General Sans', sans-serif" }}
              >
                {skillTitle}
              </h1>
              <p className="text-lg text-zinc-500 leading-relaxed">
                A comprehensive foundation tailored for you, covering everything from the basics to building your first real project.
              </p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-6 flex flex-col items-center justify-center min-w-[160px]">
              <span className="text-4xl font-bold" style={{ fontFamily: "'General Sans', sans-serif" }}>{weeksTotal}</span>
              <span className="text-sm text-zinc-400 font-medium uppercase tracking-wider mt-1">Weeks Total</span>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { icon: <Clock size={20} />, value: `${totalHours}h`, label: "Total Learning" },
            { icon: <Layers size={20} />, value: lessons.length, label: "Resource Items" },
            { icon: <Video size={20} />, value: `${videoPct}%`, label: "Video Content" },
            { icon: <BookOpen size={20} />, value: `${otherPct}%`, label: "Courses & Docs" },
          ].map((stat, i) => (
            <div key={i} className="p-5 border border-zinc-100 rounded-2xl bg-white shadow-sm">
              <div className="text-zinc-400 mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Curriculum breakdown */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "'General Sans', sans-serif" }}>
              Curriculum Breakdown
            </h2>
            <div className="text-sm text-zinc-500 font-medium">{lessons.length} Lessons</div>
          </div>

          <div className="space-y-4">
            {lessons.map((lesson, idx) => {
              const isFirst = idx === 0;
              const tag =
                lesson.content_type === "video"
                  ? { icon: <Video size={10} />, label: "Video" }
                  : lesson.content_type === "text"
                  ? { icon: <BookOpen size={10} />, label: "Article" }
                  : { icon: <Layers size={10} />, label: "Course" };

              return (
                <div
                  key={lesson.id}
                  className="group p-6 border border-zinc-100 rounded-3xl hover:border-zinc-300 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-6">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm ${
                          isFirst ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                        }`}
                        style={{ fontFamily: "'General Sans', sans-serif" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{lesson.title}</h3>
                        <div className="flex gap-3 mt-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-bold uppercase text-zinc-400">
                            {tag.icon} {tag.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-bold uppercase text-zinc-400">
                            <Clock size={10} /> ~3 Hours
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-zinc-300 group-hover:translate-x-1 transition-transform shrink-0 mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-4 py-12 border-t border-zinc-100">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full md:w-auto px-10 py-5 bg-zinc-900 text-white rounded-2xl font-semibold text-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-zinc-100 flex items-center justify-center gap-3"
          >
            <span>Sync with My Calendar</span>
            <CalendarRange size={20} />
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full md:w-auto px-10 py-5 bg-white text-zinc-900 border-2 border-zinc-100 rounded-2xl font-semibold text-lg hover:border-zinc-900 transition-all duration-300 flex items-center justify-center"
          >
            Start Learning Now
          </button>
        </section>
      </main>

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onConfirm={() => { setShowScheduleModal(false); router.push("/dashboard"); }}
        />
      )}
    </div>
  );
}
