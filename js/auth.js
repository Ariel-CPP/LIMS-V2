import { supabase } from './supabaseClient.js';
import { toast } from './ui.js';

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = './index.html';
    return null;
  }
  return session;
}

export async function getProfile() {
  const session = await requireAuth();
  if (!session) return null;
  const { data, error } = await supabase
      .from('user_profile')
      .select('name,email,role')
      .eq('user_id', session.user.id)
      .maybeSingle();
  if (error) {
    console.error(error);
    toast('Gagal mengambil profil (cek RLS).');
  }
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = './index.html';
}
