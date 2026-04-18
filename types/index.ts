export type ContentType = "video" | "text" | "link";

export type Profile = {
  id: string;
  full_name: string | null;
  goals: string | null;
  availability: Availability | null;
  active_skill_id: string | null;
  created_at: string;
};

export type Availability = {
  days: string[];
  time: string;
};

export type Skill = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type Lesson = {
  id: string;
  skill_id: string;
  title: string | null;
  content_type: ContentType | string | null;
  content_url: string | null;
  order_index: number | null;
  created_at: string;
};

export type UserLesson = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
};

export type Task = {
  id: string;
  skill_id: string | null;
  title: string | null;
  description: string | null;
  order_index: number | null;
};

export type UserTask = {
  id: string;
  user_id: string;
  task_id: string;
  submission: string | null;
  completed: boolean;
  created_at: string;
};
