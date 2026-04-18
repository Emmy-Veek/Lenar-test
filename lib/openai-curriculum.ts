import { curriculumResponseSchema, type CurriculumResponse } from "@/lib/curriculum-schema";
import { fallbackCurriculum } from "@/lib/curriculum-fallback";

export async function generateCurriculumWithOpenAI(params: {
  skillTitle: string;
  goals: string | null;
  availabilitySummary: string;
}): Promise<CurriculumResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackCurriculum(params.skillTitle);
  }

  const system = `You are a curriculum designer. Return ONLY valid JSON matching this shape:
{"lessons":[{"title":"string","content_type":"video"|"text"|"link","content_url":"string","order_index":number},...],
"tasks":[{"title":"string","description":"string","order_index":number},...]}
Use realistic placeholder URLs for content_url when unknown. 3-6 lessons, 0-2 tasks.`;

  const user = `Skill: ${params.skillTitle}
User goals: ${params.goals ?? "not specified"}
Availability: ${params.availabilitySummary}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    return fallbackCurriculum(params.skillTitle);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    return fallbackCurriculum(params.skillTitle);
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const validated = curriculumResponseSchema.safeParse(parsed);
    if (!validated.success) {
      return fallbackCurriculum(params.skillTitle);
    }
    return validated.data;
  } catch {
    return fallbackCurriculum(params.skillTitle);
  }
}
