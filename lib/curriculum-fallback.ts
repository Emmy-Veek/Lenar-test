import type { CurriculumResponse } from "@/lib/curriculum-schema";

export function fallbackCurriculum(skillTitle: string): CurriculumResponse {
  const base = skillTitle.trim() || "your skill";
  return {
    lessons: [
      {
        title: `Introduction to ${base}`,
        content_type: "text",
        content_url: `https://example.com/learn/${encodeURIComponent(base)}/intro`,
        order_index: 0,
      },
      {
        title: `${base}: core concepts`,
        content_type: "link",
        content_url: `https://example.com/learn/${encodeURIComponent(base)}/core`,
        order_index: 1,
      },
      {
        title: `${base}: practice session`,
        content_type: "text",
        content_url: `https://example.com/learn/${encodeURIComponent(base)}/practice`,
        order_index: 2,
      },
    ],
    tasks: [
      {
        title: `Reflection: why ${base}?`,
        description: "Write 3 sentences on what you want to achieve and one obstacle you expect.",
        order_index: 0,
      },
    ],
  };
}
