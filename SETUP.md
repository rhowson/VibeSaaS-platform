# 🚀 SaaS Platform Setup Guide

This guide will help you set up the AI-powered SaaS platform with all necessary configurations.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository cloned
- Supabase account
- OpenAI API key (optional)
- Anthropic API key (optional)

## 🔧 Step 1: Environment Configuration

### 1.1 Copy Environment Template
```bash
cp env-template.txt .env.local
```

### 1.2 Generate Secure Secrets
```bash
node scripts/generate-secrets.js
```

### 1.3 Update Environment Variables

Edit `.env.local` and replace the placeholder values:

```bash
# Replace these with the generated secrets from step 1.2
NEXTAUTH_SECRET=5KMbA1f4TD/Kxm3v8hsnS4WYSouZ9iE8kWBinQRDrg0=
JWT_SECRET=qiy3mJqXA/P16+nOta/r//G/zAmT5IkT2Qd12U6+l+M=

# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Replace with your AI provider keys
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

## 🗄️ Step 2: Supabase Setup

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and keys

### 2.2 Run Database Schema
Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Users/profiles
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
  extracted_text text,
  status text default 'uploaded',
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
  depends_on uuid[],
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
  user_id uuid references profiles(id) on delete cascade,
  ai_provider text not null default 'openai',
  openai_model text default 'gpt-4o-mini',
  anthropic_model text default 'claude-3-5-sonnet',
  temperature numeric default 0.2,
  top_p numeric default 1.0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2.3 Enable Row-Level Security
Run this additional SQL:

```sql
-- Enable RLS on all tables
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

-- Helper function
create or replace function is_project_member(p_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from project_members pm
    where pm.project_id = p_id and pm.user_id = auth.uid()
  );
$$;

-- Basic policies (add more as needed)
create policy "read own projects"
on projects for select
using ( owner_id = auth.uid() or is_project_member(id) );

create policy "insert projects"
on projects for insert
with check ( owner_id = auth.uid() );
```

### 2.4 Create Storage Bucket
```sql
-- Create storage bucket for project documents
insert into storage.buckets (id, name, public)
values ('project-docs', 'project-docs', false);
```

## 🔑 Step 3: API Keys Setup

### 3.1 OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-your_key_here`

### 3.2 Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-your_key_here`

## 📦 Step 4: Install Dependencies

```bash
# Install required packages
npm install @supabase/supabase-js @next-auth/supabase-adapter react-dropzone

# Install development dependencies
npm install -D @types/node
```

## 🚀 Step 5: Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at: http://localhost:3000

## 🧪 Step 6: Test the Setup

1. **Visit the application**: http://localhost:3000
2. **Create a project**: Navigate to "Create Project"
3. **Test authentication**: Try signing up/signing in
4. **Test file upload**: Upload a document in project creation
5. **Test AI features**: Start the AI analysis process

## 🔍 Troubleshooting

### Common Issues:

1. **Environment variables not loading**
   - Ensure `.env.local` is in the project root
   - Restart the development server

2. **Supabase connection errors**
   - Verify your Supabase URL and keys
   - Check if RLS policies are properly set

3. **AI features not working**
   - Verify API keys are correct
   - Check if the AI provider is selected in settings

4. **File upload issues**
   - Ensure storage bucket is created
   - Check storage policies

### Debug Commands:

```bash
# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Test Supabase connection
node -e "const { createClient } = require('@supabase/supabase-js'); console.log('Supabase client created')"

# Check for missing dependencies
npm ls @supabase/supabase-js
```

## 📚 Next Steps

1. **Implement API Routes**: Create the backend API endpoints
2. **Add Authentication**: Configure NextAuth.js with Supabase
3. **Test AI Integration**: Verify OpenAI/Anthropic API calls
4. **Deploy to Production**: Set up Vercel deployment

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for errors
3. Verify all environment variables are set correctly
4. Ensure Supabase schema is properly applied

---

**🎉 Congratulations!** Your SaaS platform is now configured and ready for development!
