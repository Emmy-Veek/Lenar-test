# Project Name: Lenar

# Product Requirements Document

## Overview
Lenara is a personalized learning platform that helps users learn any skill by providing curated lessons, schedules, and tasks tailored to their availability. It is for anyone, beginners, hobbyists, or professionals, who wants a structured yet flexible way to learn.

## Target Users
Our users are lifelong learners, ranging from absolute beginners to hobbyists and professionals who want to upskill. They might be working full-time, students, or curious people with busy schedules. Currently, they often rely on scattered online tutorials, unscheduled learning, or generic courses that do not fit their lives.

## Problem Statement
Right now, learners struggle to find a personalized, structured approach to learning. They waste time searching for quality content, do not have a plan that fits their schedules, and often lack accountability or validation. Existing solutions feel too rigid or too broad; they need something that adapts to them.

## Core Features in MVP
1. **User Sign-up and Authentication (P0):** Users create an account, log in, and set up a profile.
2. **Profile Setup (P0):** Users input interests, goals, and availability.
3. **Skill/Topic Selection (P0):** Users choose the skill they want to learn.
4. **AI-Driven Curriculum (P0):** AI generates a step-by-step learning plan based on the selected skill and user availability.
5. **Calendar Integration (P0):** Users' learning activities are synced with their calendar.
6. **Lesson Delivery (P0):** Lessons are delivered in multiple formats (video, text, and external links).
7. **Task Assignments (P1):** After a few lessons, users receive small tasks (like reflections or mini-projects).
8. **Progress Tracking (P1):** Users see completed lessons, tasks, and overall progress.
9. **AI Feedback (P2):** AI offers suggestions on pacing and adjustments.
10. **Dashboard (P1):** A simple overview of lessons, tasks, and upcoming events.

## Pages and Screens
### 1) Welcome Screen
- **Actions:** Sign up, log in, or continue.
- **Data:** Intro copy and call-to-action buttons.

### 2) Profile Setup
- **Actions:** Input forms and save preferences.
- **Data:** User profile information and preferences.

### 3) Skill Selection
- **Actions:** Browse topics and select one.
- **Data:** List of available skills.

### 4) Dashboard
- **Actions:** View lessons, check calendar, and see progress.
- **Data:** Lesson lists, progress bars, and upcoming schedule.

### 5) Lesson Page
- **Actions:** Watch video, read text, and click external links.
- **Data:** Lesson content, duration, and next steps.

### 6) Task Page
- **Actions:** Review task, submit a reflection, and upload a project.
- **Data:** Task description and submission form.

## User Flows
### First-Time User Flow
1. User lands on the welcome screen and signs up.
2. User fills out their profile (interests, goals, availability).
3. User selects a skill they want to learn.
4. AI generates a first set of lessons, and the user sees them on the dashboard.
5. User starts the first lesson, tracks progress, and receives the first task.

### Daily Use Flow
1. User opens the dashboard each day to check lessons and tasks.
2. User views the next lesson, starts it, and marks it as completed.
3. After completing the lesson, user sees an assigned task and works on it.
4. User submits the task (reflection, mini-project, etc.).
5. Progress is updated, and the next day's lesson appears.

### Key Action Flows
- **Progress Review:** Users check progress on the dashboard.
- **Calendar Sync:** Users link or update their calendar to automatically schedule lessons.
- **Task Submission:** Users submit reflections or project work after each milestone.

## Out of Scope (Not in MVP)
- Advanced AI personalization beyond basic pacing (for example, deep personality or career-based tailoring).
- In-app messaging or social features (like forums).
- Integration with third-party platforms (other than calendar).
- Mobile app (planned after the web MVP).

## Success Metrics
- **User Engagement:** Track how many users complete their first lesson.
- **Retention:** Monitor how many users return daily or weekly.
- **Task Completion:** Measure how many tasks are submitted on time.
- **Course Completion Rate:** Track how many users finish at least one full skill path.

## Design Direction
The look should be clean, modern, and approachable, with soft colors, generous white space, and intuitive navigation.
It should feel friendly, like a personal coach, with a dash of productivity: similar to Duolingo's simplicity, but with a more professional tone.

## Open Questions
- What exact skills should we prioritize for launch? Should we focus on one niche first (for example, coding) or keep it broad?
- What external tools or integrations will we need for calendar sync?
- How will we measure AI suggestions? What is a good baseline for pacing feedback?

## Assumptions
- Users are willing to complete onboarding (profile + skill selection) before seeing personalized lesson plans.
- Users have access to at least one calendar provider that supports reliable event sync for scheduling lessons.
- Curated learning content for initial launch skills is available and can be organized into progressive lesson paths.
- AI-generated pacing suggestions are advisory and do not replace explicit user controls over schedule and workload.
- MVP success depends on web-first adoption; mobile experience is a post-MVP phase.

## Risks
- **Content quality risk:** If source lessons are inconsistent, user trust and completion rates may drop.
- **Personalization risk:** Weak initial AI recommendations can feel generic and reduce engagement early in the journey.
- **Calendar dependency risk:** Integration failures or permission issues may break core scheduling value.
- **Retention risk:** Users with busy schedules may churn without timely reminders and visible progress milestones.
- **Scope risk:** Expanding skills/integrations too early could delay launch and reduce MVP focus.
