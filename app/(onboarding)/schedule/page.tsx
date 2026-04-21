"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Settings2, Sunrise, Sun, Moon, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const calendarOptions = [
  {
    id: "google",
    label: "Google Calendar",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.7-2.1 4.9-4.4 6.4v5.3h7.1c4.2-3.8 6.7-9.5 6.7-15.4z" />
        <path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.5l-7.1-5.3c-2 1.3-4.5 2.1-7.8 2.1-6 0-11.1-4-12.9-9.5H3.8v5.5C7.5 41.8 15.2 46 24 46z" />
        <path fill="#FBBC05" d="M11.1 27.8c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.5H3.8C2.3 17 1.5 20.4 1.5 24s.8 7 2.3 9.9l7.3-6.1z" />
        <path fill="#EA4335" d="M24 10.8c3.4 0 6.4 1.2 8.8 3.4l6.5-6.5C35.2 4 29.7 2 24 2 15.2 2 7.5 6.2 3.8 14.1l7.3 5.5C12.9 14.9 18 10.8 24 10.8z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Apple Calendar",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <path fill="#111" d="M35.1 25.5c0-5.1 4.2-7.6 4.4-7.7-2.4-3.5-6.1-4-7.4-4-3.1-.3-6.1 1.8-7.7 1.8-1.6 0-4-.8-6.6-.7-3.3.1-6.4 1.9-8.1 4.9-3.5 6-.9 14.8 2.5 19.7 1.7 2.4 3.6 5 6.2 4.9 2.5-.1 3.4-1.6 6.4-1.6s3.8 1.6 6.4 1.5c2.7 0 4.4-2.4 6-4.8 1.9-2.7 2.7-5.4 2.7-5.5-.1 0-5.2-1.9-5.2-7.5z" />
        <path fill="#111" d="M29.8 10.4c1.4-1.7 2.3-4 2-6.4-2 .1-4.4 1.3-5.8 3-1.3 1.5-2.4 3.9-2.1 6.2 2.2.2 4.5-1.1 5.9-2.8z" />
      </svg>
    ),
  },
  {
    id: "notion",
    label: "Notion Calendar",
    icon: (
      <svg width="36" height="40" viewBox="0 0 313 325" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_15577_78623)">
          <path d="M304.079 47.841C309.742 53.152 312.85 60.439 312.85 68.355V284.638C312.85 284.725 312.847 284.812 312.843 284.9C312.829 285.178 312.8 285.455 312.8 285.733L312.825 285.859C312.825 298.91 302.607 310.225 289.77 311.798C288.852 311.948 287.933 312.062 286.989 312.125L75.318 324.937C74.651 324.975 73.997 325 73.342 325C73.267 325 73.195 324.994 73.122 324.987C73.05 324.981 72.977 324.975 72.902 324.975C72.751 324.975 72.603 324.981 72.455 324.987C72.307 324.994 72.159 325 72.008 325C64.47 325 57.41 322.231 51.961 317.109C46.059 311.559 42.775 303.944 42.775 295.688V285.405C42.775 283.316 42.372 282.196 39.943 282.196C39.943 282.196 33.286 282.322 32.594 282.322C24.187 282.322 16.322 279.227 10.244 273.513C3.6621 267.32 0.0378036 258.837 0.0378036 249.638L0 48.495C0 29.806 15.177 13.658 33.827 12.501L234.764 0.0659666C243.938 -0.500433 252.634 2.59556 259.216 8.77516C265.797 14.955 269.421 23.425 269.421 32.637V38.993C269.421 38.993 269.295 41.12 272.052 41.032L283.063 40.365C290.953 39.861 298.416 42.53 304.079 47.841Z" fill="white"/>
          <path d="M33.9543 269.071C28.3033 269.008 23.2823 267.562 19.3813 263.924C19.3813 263.924 19.3683 263.924 19.3563 263.899C18.9033 263.458 18.4753 263.006 18.0723 262.552C14.9893 259.028 13.3153 254.51 13.3153 249.627L13.2773 48.484C13.2773 36.843 23.0933 26.397 34.7093 25.679L235.62 13.245C236.061 13.22 236.488 13.207 236.929 13.207C241.95 13.207 246.632 15.019 250.206 18.392C250.696 18.858 251.162 19.336 251.59 19.84C252.337 20.692 253 21.602 253.58 22.564C253.001 21.609 252.334 20.702 251.59 19.852C254.598 23.351 256.246 27.806 256.246 32.639V37.787C256.246 37.787 256.372 42.003 252.194 42.28L252.219 42.305L67.4283 53.884C53.8753 54.727 42.8643 66.469 42.8643 80.049C42.8643 80.049 42.7883 265.699 42.7753 266C42.6373 269.071 40.1073 269.071 38.0183 269.071H33.9543Z" fill="black"/>
          <path d="M299.626 285.546C299.651 285.244 299.676 284.941 299.676 284.639L299.626 67.274C299.55 66.129 299.361 65.009 299.046 63.939C298.317 61.434 296.957 59.182 295.032 57.382C292.276 54.802 288.677 53.405 284.813 53.405C284.474 53.405 284.133 53.417 283.794 53.443L69.3538 66.884C69.2788 66.889 69.2028 66.902 69.1278 66.914C69.0268 66.93 68.9258 66.947 68.8258 66.947C62.0048 67.652 56.2918 73.617 55.8258 80.451C55.8008 80.753 55.8008 81.043 55.8008 81.345V294.318C55.8008 294.42 55.8068 294.519 55.8138 294.616C55.8198 294.711 55.8258 294.804 55.8258 294.896C55.9638 299.667 57.8648 304.021 61.2498 307.205C64.2698 310.049 68.1458 311.66 72.3368 311.875H73.0038L287.33 298.899C287.393 298.899 287.456 298.889 287.519 298.88C287.565 298.873 287.611 298.866 287.658 298.862C287.674 298.862 287.691 298.861 287.708 298.861C294.038 297.691 299.184 292.002 299.626 285.546ZM89.4268 288.339C82.0898 288.855 75.5958 286.364 75.7968 276.748V127.08C75.7968 121.946 80.0258 118.661 84.6938 118.421L271.247 107.233C275.904 106.994 279.716 110.367 279.716 115.036V264.968C279.716 270.455 278.345 277.516 268.906 277.881H268.881L268.868 277.893L89.4268 288.339Z" fill="black"/>
          <path d="M132.566 164.787C123.906 165.322 120.962 171.932 120.974 182.09V183.876C119.941 184.119 119.076 184.349 118.03 184.41C111.791 184.799 107.29 179.733 107.278 170.644C107.266 156.744 119.721 143.658 143.452 142.188C164.581 140.875 178.106 151.082 178.131 169.089C178.143 182.636 166.892 192.247 155.811 195.26C176.598 196.282 185.271 207.873 185.295 222.66C185.319 247.97 166.807 262.319 138.222 264.106L137.529 264.154C116.047 265.491 100.965 257.338 100.953 243.255C100.953 235.236 106.827 228.444 115.659 227.897C116.352 227.849 117.045 227.994 117.738 227.946C119.49 242.283 129.197 247.557 138.891 246.961C148.245 246.378 154.825 240.084 154.813 231.165V230.813C154.801 216.901 143.185 216.209 125.693 215.516L122.908 198.93C139.183 195.954 147.32 190.631 147.308 181.008C147.308 170.668 141.567 164.253 132.566 164.811V164.787Z" fill="black"/>
          <path d="M210.681 157.959C193.359 162.965 189.541 155.358 191.438 147.388C201.825 144.958 228.841 136.854 239.058 133.196L239.18 239.987L258.07 242.732C258.07 249.683 254.105 254.032 247.001 254.482C241.114 254.846 227.43 255.345 220.849 255.758C210.632 256.39 191.924 257.921 191.924 257.921C191.401 256.524 191.231 255.114 191.231 253.862C191.231 250.472 192.605 246.998 197.106 245.478L210.79 241.056L210.693 157.971L210.681 157.959Z" fill="black"/>
        </g>
        <defs>
          <clipPath id="clip0_15577_78623">
            <rect width="312.85" height="325" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    ),
  },
];

const learningWindows = [
  {
    id: "morning",
    title: "Morning Peak",
    time: "08:30 AM — 09:30 AM",
    tag: "95% Energy",
    label: "Suggested",
    defaultOn: true,
    icon: <Sunrise size={18} className="text-orange-400" />,
    iconBg: "bg-orange-50",
  },
  {
    id: "afternoon",
    title: "Afternoon Focus",
    time: "02:00 PM — 03:30 PM",
    tag: "Quiet Window",
    label: "Suggested",
    defaultOn: false,
    icon: <Sun size={18} className="text-blue-400" />,
    iconBg: "bg-blue-50",
  },
  {
    id: "night",
    title: "Night Owl",
    time: "09:00 PM — 10:00 PM",
    tag: "Deep Work",
    label: "Optional",
    defaultOn: false,
    icon: <Moon size={18} className="text-indigo-400" />,
    iconBg: "bg-indigo-50",
  },
];

function ScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    morning: true,
    afternoon: false,
    night: false,
  });
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);
  const [showAppleModal, setShowAppleModal] = useState(false);

  useEffect(() => {
    const calendar = searchParams.get("calendar");
    const connected = searchParams.get("connected");
    if (calendar && connected === "true") {
      setConnectedCalendars((prev) =>
        prev.includes(calendar) ? prev : [...prev, calendar]
      );
    }
  }, [searchParams]);

  function toggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleCalendarConnect(id: string) {
    if (id === "google") {
      window.location.href = "/api/auth/google-calendar";
    } else if (id === "notion") {
      window.location.href = "/api/auth/notion-calendar";
    } else if (id === "apple") {
      setShowAppleModal(true);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-center font-bold leading-tight mb-3 text-4xl">
          <span className="text-gray-900">Find your perfect </span>
          <span className="text-gray-300">learning flow</span>
        </h1>
        <p className="text-center text-gray-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
          Lenar analyzes your calendar to suggest study slots when you're most
          productive and naturally free.
        </p>

        {/* Calendar options */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {calendarOptions.map(({ id, label, icon }) => {
            const isConnected = connectedCalendars.includes(id);
            return (
              <button
                key={id}
                onClick={() => handleCalendarConnect(id)}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border py-6 px-4 transition-colors ${
                  isConnected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-300"
                }`}
              >
                {isConnected && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                    <Check size={10} />
                  </span>
                )}
                {icon}
                <span className={`text-sm font-semibold text-center ${isConnected ? "text-green-700" : "text-gray-800"}`}>
                  {isConnected ? "Connected" : label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optimal Learning Windows */}
        <div className="rounded-3xl bg-gray-50 border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Optimal Learning Windows</h2>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Settings2 size={13} />
              <span className="text-xs font-semibold tracking-widest uppercase">AI Analysis Active</span>
            </div>
          </div>

          <div className="space-y-3">
            {learningWindows.map(({ id, title, time, tag, label, icon, iconBg }) => (
              <div
                key={id}
                className="flex items-center justify-between bg-white rounded-2xl px-4 py-4 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400">{time} ({tag})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300">{label}</span>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
                      toggles[id] ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        toggles[id] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={async () => {
              const activeWindows = learningWindows
                .filter(({ id }) => toggles[id])
                .map(({ id, time }) => ({ id, time }));
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: profile } = await supabase.from("profiles").select("availability").eq("id", user.id).maybeSingle();
                await supabase.from("profiles").upsert(
                  { id: user.id, availability: { ...(profile?.availability as object ?? {}), windows: activeWindows } },
                  { onConflict: "id" }
                );
              }
              router.push("/curriculum");
            }}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base rounded-2xl px-14 py-5 transition-colors"
          >
            Confirm Schedule <ArrowRight size={18} />
          </button>
          <div className="text-center">
            <button
              onClick={() => router.push("/curriculum")}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now, I'll set it manually
            </button>
            <p className="text-xs text-gray-300 mt-1">Note: Auto-scheduling will be disabled</p>
          </div>
        </div>
      </div>

      {/* Apple Calendar Modal */}
      {showAppleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl relative">
            <button
              onClick={() => setShowAppleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 48 48" className="w-8 h-8 flex-shrink-0">
                <path fill="#111" d="M35.1 25.5c0-5.1 4.2-7.6 4.4-7.7-2.4-3.5-6.1-4-7.4-4-3.1-.3-6.1 1.8-7.7 1.8-1.6 0-4-.8-6.6-.7-3.3.1-6.4 1.9-8.1 4.9-3.5 6-.9 14.8 2.5 19.7 1.7 2.4 3.6 5 6.2 4.9 2.5-.1 3.4-1.6 6.4-1.6s3.8 1.6 6.4 1.5c2.7 0 4.4-2.4 6-4.8 1.9-2.7 2.7-5.4 2.7-5.5-.1 0-5.2-1.9-5.2-7.5z" />
                <path fill="#111" d="M29.8 10.4c1.4-1.7 2.3-4 2-6.4-2 .1-4.4 1.3-5.8 3-1.3 1.5-2.4 3.9-2.1 6.2 2.2.2 4.5-1.1 5.9-2.8z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Connect Apple Calendar</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Apple Calendar uses CalDAV and doesn't support direct web OAuth. You can connect it via your iCloud account in two ways:
            </p>
            <ol className="text-sm text-gray-600 space-y-2 mb-6 list-decimal list-inside">
              <li>Open <strong>System Settings → Internet Accounts</strong> on your Mac and ensure iCloud Calendar is enabled.</li>
              <li>Or manage your calendar directly on iCloud.com.</li>
            </ol>
            <a
              href="https://www.icloud.com/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-2xl px-6 py-4 transition-colors"
            >
              Open iCloud Calendar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleContent />
    </Suspense>
  );
}
