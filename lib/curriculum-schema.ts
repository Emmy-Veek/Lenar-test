import { z } from "zod";

export const curriculumLessonSchema = z.object({
  title: z.string().min(1),
  content_type: z.enum(["video", "text", "link"]),
  content_url: z.string().min(1),
  order_index: z.number().int().nonnegative(),
});

export const curriculumTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order_index: z.number().int().nonnegative(),
});

export const curriculumResponseSchema = z.object({
  lessons: z.array(curriculumLessonSchema).min(1).max(20),
  tasks: z.array(curriculumTaskSchema).min(0).max(10),
});

export type CurriculumResponse = z.infer<typeof curriculumResponseSchema>;
