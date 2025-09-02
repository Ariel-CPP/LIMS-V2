// Supabase singleton
export const SUPABASE_URL = "https://zhlfizeseaoouxgptzwy.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobGZpemVzZWFvb3V4Z3B0end5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODgzODUsImV4cCI6MjA3MjM2NDM4NX0.jaSvPFMzxztCZ2wBvsUF53frUE38Jp0IFV1E2DGlj9Y";

// Using ESM from CDN for static hosting
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
