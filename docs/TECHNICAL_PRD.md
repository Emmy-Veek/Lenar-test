# Technical Product Requirements Document

## Tech Stack (Specific Versions)

### Core Framework
- **Next.js `14.2.5` (App Router)**
  - Fullstack React framework (frontend + API routes)
  - Supports Server Components for better performance
  - Works seamlessly with Vercel
- **TypeScript `5.4.5`**
  - Strong typing for safer, scalable code
  - Helps AI generate more accurate code

### Styling and UI
- **Tailwind CSS `3.4.3`**
  - Utility-first CSS for rapid UI building
  - Easy to maintain and keep consistent
- **shadcn/ui (latest)**
  - Prebuilt accessible components (Button, Card, Input, etc.)
  - Built on Radix UI
  - Fully customizable
- **lucide-react `0.378.0`**
  - Icon library for UI consistency

### Backend and Infrastructure
- **Supabase JS Client `2.43.4`**
  - Authentication
  - Database (Postgres)
  - Storage (file uploads)
  - Realtime subscriptions

### State and Forms
- **React Hook Form `7.51.3`**
  - Form handling with fast performance and minimal re-renders
- **Zod `3.23.8`**
  - Schema validation for forms and APIs

### Utilities
- **date-fns `3.6.0`**
  - Date formatting for lesson scheduling and timeline logic

### Deployment
- **Vercel (latest)**
  - Hosting + CI/CD optimized for Next.js

## Project Structure
```text
/app
  /(auth)
    /login
    /signup
    /reset-password

  /(dashboard)
    /dashboard
    /learn/[skillId]
    /task/[taskId]

  /api
    /generate-curriculum
    /tasks
    /progress

/components
  /ui (shadcn components)
  /layout
  /dashboard
  /lesson
  /task

/lib
  supabase.ts
  auth.ts
  utils.ts

/hooks
  useUser.ts
  useLessons.ts
  useTasks.ts

/types
  index.ts

/styles
  globals.css

/middleware.ts
```

### Notes
- `/app` -> Route definitions (Next.js App Router)
- `/lib` -> Shared helpers (Supabase client, auth helpers, utility functions)
- `/hooks` -> Client-side data and interaction logic
- `/components` -> Reusable UI blocks and feature components

## Database Schema (Supabase / Postgres)

### Tables

#### 1) users (handled by Supabase Auth)
Use `auth.users`.

#### 2) profiles
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  goals text,
  availability jsonb, -- {days: [], time: ""}
  created_at timestamp default now()
);
```

#### 3) skills
```sql
create table skills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamp default now()
);
```

#### 4) lessons
```sql
create table lessons (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skills(id) on delete cascade,
  title text,
  content_type text, -- "video" | "text" | "link"
  content_url text,
  order_index int,
  created_at timestamp default now()
);
```

#### 5) user_lessons
```sql
create table user_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamp
);
```

#### 6) tasks
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skills(id),
  title text,
  description text,
  order_index int
);
```

#### 7) user_tasks
```sql
create table user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  task_id uuid references tasks(id),
  submission text,
  completed boolean default false,
  created_at timestamp default now()
);
```

## API Routes

### 1) Generate Curriculum
`POST /api/generate-curriculum`

**Request body**
```json
{
  "skill": "learn guitar"
}
```

**Response**
```json
{
  "lessons": [],
  "tasks": []
}
```

### 2) Get User Lessons
`GET /api/lessons`

- Auth required

### 3) Complete Lesson
`POST /api/lessons/complete`

### 4) Submit Task
`POST /api/tasks/submit`

### 5) Get Progress
`GET /api/progress`

## Authentication Flow (Supabase Auth)

### Signup
1. User enters email and password.
2. Call `supabase.auth.signUp()`.
3. Create profile row.
4. Redirect to onboarding.

### Login
Call `supabase.auth.signInWithPassword()`.

### Logout
Call `supabase.auth.signOut()`.

### Password Reset
Call `supabase.auth.resetPasswordForEmail()`.

## Component Hierarchy
```text
AppLayout (Server)
 ├── Navbar (Client)
 ├── DashboardPage (Server)
 │    ├── ProgressCard
 │    ├── LessonList
 │    ├── TaskList
 │
 ├── LessonPage
 │    ├── LessonContent
 │    ├── CompleteButton
 │
 ├── TaskPage
      ├── TaskDetails
      ├── SubmissionForm
```

### Rule
- Server Components -> data fetching
- Client Components -> user interaction

## State Management
- Server state: fetched through Supabase in Server Components
- Client state: local React state
- Forms: React Hook Form
- No global state library needed for MVP

## Third-Party Services

### Supabase
- Auth
- Database
- Storage

### Vercel
- Hosting
- Deployment

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

## Build and Deploy

### Local
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Deploy
1. Push to GitHub.
2. Connect repository to Vercel.
3. Add environment variables.
4. Deploy.

## Implementation Order

### Phase 1 (Foundation)
1. Set up Next.js project.
2. Set up Supabase project and client.
3. Implement auth (signup/login/logout).
4. Implement profile creation.

### Phase 2 (Core Product)
5. Build skill selection UI.
6. Build curriculum generation API (mock first).
7. Build lessons table integration and lesson UI.
8. Build dashboard.

### Phase 3 (Engagement)
9. Implement task system.
10. Implement progress tracking.
11. Implement lesson completion flow.

### Phase 4 (Polish)
12. Add basic calendar scheduling display.
13. Polish UI using shadcn components.
14. Improve error handling and edge states.

## Final Note (Important)
For MVP:
- Do **not** build full AI curriculum generation.
- Use one of:
  - Predefined lesson templates
  - A simple GPT call returning structured JSON

