# Fox Solutions — Customer Requirements App

A web app for salespeople to capture customer requirements for packaging line projects. Submissions are stored in Supabase and viewable at `/submissions`.

---

## Setup (one-time, ~20 minutes)

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (any name, e.g. "fox-requirements")
3. Once the project is ready, go to **SQL Editor** and paste the contents of `supabase_schema.sql` and click **Run**
4. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon/public** key

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. GitHub

1. Create a new repo on GitHub (e.g. `fox-requirements`)
2. Push this project to it:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fox-requirements.git
git push -u origin main
```

### 4. Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **Add new site → Import an existing project**
3. Select your GitHub repo
4. Build settings will be auto-detected from `netlify.toml`
5. Go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy site**

Your site will be live at a URL like `https://fox-requirements.netlify.app`

---

## Local development

```bash
npm install
npm run dev
```

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Customer requirements form (share this with salespeople) |
| `/submissions` | View all submitted forms |

---

## Project structure

```
src/
  App.jsx           # Main intake form
  App.css           # Form styles
  Submissions.jsx   # Submissions dashboard
  Submissions.css   # Dashboard styles
  main.jsx          # Router entry point
  index.css         # Global styles
  lib/
    supabase.js     # Supabase client
    stages.js       # Line stage config (shared)
supabase_schema.sql # Database + storage setup
netlify.toml        # Netlify build config
.env.example        # Environment variable template
```
