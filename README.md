# LIMS CPP v:2.0 — Frontend (Static, GitHub Pages)

**Stack:** Static HTML + ES Modules + Supabase JS (Auth, PostgREST).  
**Backend:** Use the SQL you installed earlier (schema `app`).

## Pages
- `index.html` — Login (Google OAuth or magic link).
- `dashboard.html` — Submissions of the current user in the last 30 days.
- `submission.html` — Create submission + sampling + lab group + add samples (+ optional aliquot barcodes).
- `reports.html` — List released reports (10/page) with keyword search.
- `admin-intake.html` — Staff intake (mark RECEIVED, reject with reason).
- `analyst.html` — Enter results per aliquot and mark REVIEWED.
- `approvals.html` — Supervisor approves and releases.
- `superadmin.html` — Supervisor-level edits for sample metadata.

## Configure
Supabase URL & anon key are centralized in `js/supabaseClient.js`:
```js
export const SUPABASE_URL = "https://zhlfizeseaoouxgptzwy.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobGZpemVzZWFvb3V4Z3B0end5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODgzODUsImV4cCI6MjA3MjM2NDM4NX0.jaSvPFMzxztCZ2wBvsUF53frUE38Jp0IFV1E2DGlj9Y";
```

> **Note:** Functions in schema `app` are not exposed to PostgREST by default.
> This frontend updates `lab_group.status` directly for status changes (RLS staff-only).
> If you prefer strict workflow validation, add a public wrapper:
>
> ```sql
> create or replace function public.rpc_set_labgroup_status(p_lab_group_id uuid, p_new text, p_note text default null)
> returns void language sql security definer as $$
>   select app.set_labgroup_status(p_lab_group_id, p_new::app.labgroup_status, p_note);
> $$;
> ```
> Then swap `setLabGroupStatus(...)` to use `supabase.rpc('rpc_set_labgroup_status', { p_lab_group_id: id, p_new: status, p_note: note })`.

## Deploy (GitHub Pages)
1. Create a repo, put these files at root.
2. Enable Pages (Settings → Pages → Source: `main` branch / `/` folder).
3. Ensure Supabase Auth redirect includes your Pages URL for Google OAuth.

## Security
All reads/writes rely on RLS you configured. Reports are private in `lims-reports` bucket; links require logged-in session (JWT added by Supabase via `Authorization` header automatically when fetched through `supabase.storage` SDK. Here, we open direct URL; for strict control, prefer an Edge Function proxy).
