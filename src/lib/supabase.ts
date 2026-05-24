import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here');
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } }
);

export async function signUpWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { data: { user: { id: `sandbox-${Date.now()}`, email } }, error: null, isSandbox: true };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error, isSandbox: false };
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { data: { user: { id: `sandbox-${Date.now()}`, email }, session: { access_token: 'sandbox-token' } }, error: null, isSandbox: true };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error, isSandbox: false };
}

export async function signOut() {
  if (!isSupabaseConfigured()) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return { data: { user: null }, error: null };
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/candidate` : undefined },
  });
  return { data, error };
}
