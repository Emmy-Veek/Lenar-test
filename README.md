# Lenar-test

Personalized learning MVP: Next.js 14, Supabase, Tailwind, and shadcn-style UI.

## Docs

- Product: [docs/PRD.md](docs/PRD.md)
- Technical: [docs/TECHNICAL_PRD.md](docs/TECHNICAL_PRD.md)

## Local setup

1. Copy [`.env.example`](.env.example) to `.env.local` and fill Supabase keys.
2. In Supabase SQL editor, run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_skills.sql`
3. Enable **Email** and **Google** providers under Authentication → Providers.
4. Add redirect URL: `http://localhost:3000/auth/callback` (and production URL when deployed).
5. Install and run:

```bash
npm install
npm run dev
```

## User flow

1. Sign up or log in (email/password or Google).
2. Complete onboarding (profile + availability).
3. Pick a seeded skill.
4. On the dashboard, **Generate my learning plan** (OpenAI optional; template fallback if no key).
5. Complete lessons and submit tasks; view progress and suggested focus times.

## Deploy (after core flows work locally)

Connect the GitHub repo to Vercel, set the same env vars, and deploy. See the Technical PRD for the full checklist.
