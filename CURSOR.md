# SaaS Project Builder — README.md

A responsive, production-ready SaaS platform that turns a rough project idea + uploaded documents into an AI-assisted, structured project plan. Users can review extracted key details (check/uncheck), answer follow-up questions, and watch a dynamic “plan building” screen as phases and tasks are generated iteratively by the selected AI provider.

Built on **Able Pro Next.js Admin** (UI boilerplate), deployed on **Vercel**, and backed by **Supabase** (Auth, DB, Storage). Supports **ChatGPT (OpenAI)** or **Claude (Anthropic)** as pluggable AI providers—selected in **Settings**—with API keys stored **only** in environment variables.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Security](#security)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database & Storage](#database--storage)
- [Row-Level Security (RLS)](#row-level-security-rls)
- [Local Development](#local-development)
- [Deploy on Vercel](#deploy-on-vercel)
- [App Modules & Navigation](#app-modules--navigation)
- [AI Workflow](#ai-workflow)
- [Iterative Plan Generation](#iterative-plan-generation)
- [Dynamic Build Screen](#dynamic-build-screen)
- [API Routes](#api-routes)
- [File Structure](#file-structure)
- [Settings & AI Provider Switch](#settings--ai-provider-switch)
- [Testing](#testing)
- [Observability](#observability)
- [Accessibility & i18n](#accessibility--i18n)
- [Roadmap / Added Gaps](#roadmap--added-gaps)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Idea → Plan:** Input a project idea, upload documents, and let AI extract key items you can **check/uncheck** for relevance.
- **Context Building:** AI asks targeted follow-ups focused on items you marked relevant.
- **Iterative Plan Generation:** Builds **phases → tasks** one phase at a time (each task includes **duration** and **execution description**), keeping within the AI context window.
- **Dynamic Progress UI:** A live, modern progress screen showing extraction, questioning, and phase-by-phase planning.
- **Per-Project Context:** Selected project flows across modules (Team, Chat, Manage Project).
- **Auth & Teams:** Supabase Auth (email/password + OAuth), per-project team membership/roles.
- **Provider-Agnostic AI:** Use **OpenAI** or **Anthropic**; toggle in **Settings**. Keys live only in server env vars.
- **Responsive UI:** Uses **Able Pro Next.js Admin** layout & components.
- **Secure by Design:** Server-only AI calls, RLS policies, signed uploads, least privilege.

---

## Architecture

- **Frontend:** Next.js (App Router) + Able Pro Next.js Admin UI components/layout.
- **Backend:** Next.js Route Handlers (server-only) + Supabase (Postgres, Auth, Storage).
- **AI Providers:** OpenAI or Anthropic, selected at runtime via Settings (no keys sent to client).
- **Streaming:** Server-Sent Events (SSE) or streamed responses for dynamic progress.
- **Storage:** Supabase Storage for documents; text extraction pipeline (PDF, DOCX, TXT, images via OCR if enabled).
- **Deployment:** Vercel (Edge/Node runtimes chosen per route needs).

---

## Security

- **Secrets in env vars** only: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SUPABASE_*`—never exposed to the browser.
- **Server-only AI calls:** Route Handlers validate auth & project membership before use.
- **RLS on all tables:** Enforced per user/project membership.
- **Signed URLs** for downloads; virus/extension/mime validation on upload.
- **Input validation** (zod) & output validation; size limits for files and prompts.
- **Rate limiting** (middleware) and abuse detection.
- **Audit trail** (optional) for critical actions.

---

## Prerequisites

- Node.js 18+
- npm 9+ (or pnpm/yarn)
- Supabase project (or Supabase CLI)
- Vercel account
- Access to **Able Pro Next.js Admin** template

---

## Installation

> **Step 0 — Able Pro Template**
>
> Install **Able Pro Next.js Admin** via **npm** as documented in the template’s **README.md**.  
> In this project, that README is placed at the root. **Follow it first** to scaffold the UI.

1) **Clone this repo** (or start inside your Able Pro project):
```bash
git clone <your-repo-url>
cd <your-repo>
npm install
```

2) **Add App Modules**  
Copy/merge the `app/` pages, `components/`, and `lib/` from this repo into your Able Pro project skeleton (see [File Structure](#file-structure)).

3) **Configure Supabase**  
Create a new Supabase project. Note the **Project URL** and **anon**/**service** keys.

4) **Create .env files**  
See [Environment Variables](#environment-variables). Create `.env.local` for local dev.

5) **Provision DB schema**  
Run the SQL in [Database & Storage](#database--storage).

6) **Enable RLS policies**  
Apply policies from [RLS](#row-level-security-rls).

7) **Start the app**  
```bash
npm run dev
```

---

## Environment Variables

Create `.env.local` (local) and add the same keys in Vercel Project Settings for production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only (never expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Auth cookies / NextAuth (if using NextAuth) or custom JWT secret
NEXTAUTH_SECRET=...
JWT_SECRET=...

# AI Providers (server-only)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# App config
MAX_UPLOAD_MB=25
ENABLE_OCR=false   # optional feature flag
```

> **Note:** AI keys are read **only** on the server. The Settings page lets you pick the provider; it never reveals or transmits keys to the client.

---

## Database & Storage

### Tables (SQL)

```sql
-- Users/profiles (supabase.auth.users is the source of truth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create type member_role as enum ('owner','admin','editor','viewer');

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  idea_text text,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists project_members (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role member_role not null default 'viewer',
  primary key (project_id, user_id),
  added_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references profiles(id),
  extracted_text text,              -- optional text extraction cache
  status text default 'uploaded',   -- uploaded|processed|failed
  created_at timestamptz default now()
);

create table if not exists extracted_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  source_document_id uuid references documents(id) on delete set null,
  label text not null,
  value text,
  confidence numeric,
  selected boolean default true,
  created_at timestamptz default now()
);

create table if not exists ai_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  question_text text not null,
  answer_text text,
  asked_at timestamptz default now(),
  answered_at timestamptz
);

create table if not exists phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  idx int not null,
  title text not null,
  description text,
  created_at timestamptz default now(),
  unique(project_id, idx)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade,
  idx int not null,
  title text not null,
  description text,
  duration_days int check (duration_days > 0),
  depends_on uuid[], -- optional
  created_at timestamptz default now(),
  unique(phase_id, idx)
);

create type chat_role as enum ('user','assistant','system');

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  role chat_role not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists app_settings (
  id bigint primary key generated always as identity,
  user_id uuid references profiles(id) on delete cascade, -- optional per-user
  ai_provider text not null default 'openai',             -- 'openai' | 'anthropic'
  openai_model text default 'gpt-4o-mini',                -- safe defaults
  anthropic_model text default 'claude-3-5-sonnet',
  temperature numeric default 0.2,
  top_p numeric default 1.0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Storage

- **Bucket:** `project-docs`
  - Public: **false**
  - Uploads via server-signed URLs.
  - Antivirus scan (if you add a webhook/edge function) and mime/size validation.

---

## Row-Level Security (RLS)

Enable RLS on all tables and add policies, e.g.:

```sql
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table documents enable row level security;
alter table extracted_items enable row level security;
alter table ai_questions enable row level security;
alter table phases enable row level security;
alter table tasks enable row level security;
alter table messages enable row level security;
alter table app_settings enable row level security;

-- Helper: is member of project
create or replace function is_project_member(p_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from project_members pm
    where pm.project_id = p_id and pm.user_id = auth.uid()
  );
$$;

-- projects
create policy "read own projects"
on projects for select
using ( owner_id = auth.uid() or is_project_member(id) );

create policy "insert projects"
on projects for insert
with check ( owner_id = auth.uid() );

create policy "update own projects"
on projects for update
using ( owner_id = auth.uid() or is_project_member(id) );

-- project_members
create policy "members read"
on project_members for select
using ( user_id = auth.uid() or exists (
  select 1 from project_members pm2 where pm2.project_id = project_id and pm2.user_id = auth.uid()
));

create policy "owner manage members"
on project_members for all
using ( exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()) )
with check ( exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()) );

-- Repeat analogous select/insert/update policies for documents, extracted_items, ai_questions, phases, tasks, messages, app_settings:
-- using ( is_project_member(project_id) )
```

---

## Local Development

```bash
npm run dev
# Default: http://localhost:3000
```

- **Auth:** Use Supabase Auth UI or custom forms (Able Pro components).
- **Project Switcher:** Top-bar dropdown to switch current project; selection persists (e.g., in local storage + server sync).
- **Provider:** Change under **Settings → AI Provider**.

---

## Deploy on Vercel

1) Push to GitHub/GitLab/Bitbucket.
2) Import into Vercel.
3) Add env vars in **Project Settings → Environment Variables** (same keys as `.env.local`).
4) Assign proper **Node/Edge runtime per route**:
   - **Node runtime** for file uploads and long CPU work.
   - **Edge runtime** is fine for lightweight AI calls/streaming if supported.
5) Set **build command** and **output** per Able Pro README.

---

## App Modules & Navigation

Left sidebar (Able Pro layout):

- **Dashboard:** Recent projects, progress overview, quick actions.
- **Create Project:** Idea input, doc upload, AI extraction → review (check/uncheck) → context Q&A → start plan build.
- **Manage Project:** Phase/task view, edit details, drag to reorder, Gantt-like timeline, export (CSV/JSON/PDF).
- **Team Members:** Invite by email, roles (owner/admin/editor/viewer), remove/transfer ownership.
- **Chat:** Project-scoped chat with AI + team messages; document citations; filters.
- **Settings:** AI provider selection, model options, project defaults, notifications, data export/delete, compliance.

A **Project Switcher** in the top bar changes current project; the selection affects Team, Chat, and Manage Project automatically.

**Auth:** Sign up / Login pages; password reset; social logins (optional).

---

## AI Workflow

1) **User Input & Upload**
   - Enter idea text.
   - Upload docs (PDF/DOCX/TXT/Markdown; images if OCR enabled).
2) **Extraction**
   - Server-side text extraction.
   - AI identifies candidate **key details** (requirements, constraints, stakeholders, risks, milestones).
3) **Review & Select**
   - UI shows labeled items with confidence; user checks/unchecks relevant ones.
4) **Context Q&A**
   - AI asks targeted follow-ups **only** about selected items; user answers.
   - Answers stored to `ai_questions`.
5) **Plan Build (Iterative)**
   - AI designs high-level phases first, then expands **phase → tasks**.
   - Each task: title, description, **duration_days**, dependencies (optional).
   - Streamed status updates feed the **Dynamic Build Screen**.

> **Provider Choice:** The Settings page toggles **OpenAI** or **Anthropic**; server chooses the right client. Keys are read from env.

---

## Iterative Plan Generation

To avoid exceeding the context window:

- **Step A:** Summarize selected items + Q&A into a compact **Project Context Summary**.
- **Step B:** Ask AI for an **outline of phases** only.
- **Step C:** For each phase `k`:
  - Provide (i) global context summary, (ii) the phase outline item, (iii) prior finalized phases as a **brief** recap.
  - Request **N tasks** with `duration_days` and an execution description.
  - Write to DB (`phases`, `tasks`) as each phase completes.
- **Step D:** Update a **running brief** (short rolling summary) to keep prompts small.

All steps stream user-visible progress events (SSE).

---

## Dynamic Build Screen

A modern progress UI (Able Pro cards, stepper, progress bar, and timeline):

- **Stages:** `Extracting → Reviewing → Asking Questions → Generating Phases → Expanding Phase k → Finalizing`
- **Real-time updates:** via `/api/progress/stream?projectId=...` (SSE).
- **Details Drawer:** Show last AI response summary and any warnings (e.g., ambiguous requirements).
- **Retry Controls:** Retry a failed phase or regenerate a specific task set.

---

## API Routes

> **All routes require auth and membership in the project.**  
> **AI keys are never exposed.**

- `POST /api/projects` — create project
- `GET /api/projects` — list projects
- `PATCH /api/projects/:id` — rename/status

- `POST /api/uploads/sign` — get signed URL for Supabase Storage
- `POST /api/documents/extract` — extract text (server), enqueue analysis

- `POST /api/ai/extract` — run extraction on idea + docs → `extracted_items`
- `POST /api/ai/questions/next` — get next best question
- `POST /api/ai/questions/answer` — store user answer

- `POST /api/ai/plan/outline` — generate phase outline
- `POST /api/ai/plan/expand` — generate tasks for one phase (id or index)
- `POST /api/ai/plan/regenerate` — regenerate a phase or task group

- `GET /api/progress/stream` — **SSE** for progress events

- `GET /api/messages?projectId=` — list chat messages
- `POST /api/messages` — send a message (to team or AI)

- `GET /api/team?projectId=` — list
- `POST /api/team/invite` — invite by email
- `PATCH /api/team/role` — change role
- `DELETE /api/team/member` — remove member

- `GET /api/settings` — read (model, temperature, provider)
- `PATCH /api/settings` — update settings (provider/model/etc.; **no API keys**)

---

## File Structure

```
app/
  (dashboard)/dashboard/page.tsx
  (projects)/create/page.tsx
  (projects)/manage/[projectId]/page.tsx
  (team)/team/page.tsx
  (chat)/chat/page.tsx
  (settings)/settings/page.tsx
  api/
    projects/route.ts
    uploads/sign/route.ts
    documents/extract/route.ts
    ai/
      extract/route.ts
      questions/
        next/route.ts
        answer/route.ts
      plan/
        outline/route.ts
        expand/route.ts
        regenerate/route.ts
    progress/stream/route.ts
components/
  project-switcher.tsx
  extract-review-list.tsx
  dynamic-build-screen.tsx
  phase-task-board.tsx
  chat-panel.tsx
  team-table.tsx
  upload-dropzone.tsx
lib/
  supabase-server.ts
  auth.ts
  ai/
    provider.ts          # selects openai|anthropic by settings
    openai.ts            # server-only client
    anthropic.ts         # server-only client
    prompts/
      extraction.ts
      questioning.ts
      outline.ts
      expand-phase.ts
  rls.ts
  sse.ts
```

---

## Settings & AI Provider Switch

- **Settings → AI Provider:** radio/select between `OpenAI` and `Anthropic`.
- **Models:** sensible defaults; allow override per user or per project.
- **Temperature/Top-p:** adjustable sliders with safe ranges.
- **Data controls:** export/delete project data; optional retention policy.

> **Keys** are not editable in UI; they live in env (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`). The Settings page simply picks the provider and models to use.

---

## Testing

- **Unit:** prompt builders, validators, parsers.
- **Integration:** API routes with mocked providers.
- **E2E:** Auth, project creation, upload, extraction → plan build.
- **Security tests:** RLS coverage, route guards, upload validation.

---

## Observability

- **Request logs:** redact PII and secrets.
- **Tracing:** wrap AI calls and DB writes.
- **Error reporting:** Sentry (server + client).
- **Metrics:** time to first phase, total planning time, token usage (by provider).

---

## Accessibility & i18n

- ARIA roles on stepper, progress, and lists; keyboard-navigable controls.
- High-contrast mode; prefers-reduced-motion.
- i18n ready (e.g., next-intl) for UI copy and prompt fragments.

---

## Roadmap / Added Gaps

- **Subscriptions & Billing:** Stripe with usage quotas.
- **Org Workspaces:** multi-tenant orgs with owner/admin roles.
- **Doc Parsers:** server-side OCR (Tesseract) and table extraction (CSV).
- **Exports:** PDF/CSV of plans; calendar (.ics) for task timelines.
- **Notifications:** email/slack webhooks on phase completion.
- **Human-in-the-loop:** approval gates between phases.
- **Template Library:** reusable project templates.
- **Data Governance:** retention windows, project-level purge, GDPR download/delete.
- **Virus Scanning:** hook on Storage upload.

---

## Troubleshooting

- **403 on API routes:** user not a project member; check RLS and `auth.uid()`.
- **Uploads fail:** verify bucket `project-docs` exists; increase `MAX_UPLOAD_MB`.
- **No AI output:** ensure provider set in Settings and the corresponding env key is present (server logs).
- **Streaming stalls:** prefer Node runtime for long requests; bump Vercel function timeout; keep-alive on SSE.

---

## License

Commercial use permitted within your organization; verify **Able Pro** license terms separately. AI provider terms (OpenAI/Anthropic) apply.

---

### Notes for Developers

- Follow **Able Pro README** first to scaffold and run the UI; this project **assumes** its components and layout system are present.
- Keep AI prompts, schemas, and parsers **server-side**. Never serialize secrets to the client.
- Prefer small, iterative prompts (outline → phase k → tasks) and maintain a **rolling context summary** to keep prompts tight.
