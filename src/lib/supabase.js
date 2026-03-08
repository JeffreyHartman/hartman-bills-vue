import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — see .env.example');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Promise that resolves once the initial auth state is known and committed to the store.
// The router guard awaits this instead of calling getSession() (which can hang).
let _resolveAuthReady;
export const authReady = new Promise(resolve => { _resolveAuthReady = resolve; });

// Fail-safe: if signalAuthReady() is never called (e.g. auth callback throws),
// resolve after 10s so the app doesn't hang forever on a blank screen.
setTimeout(() => {
  if (_resolveAuthReady) {
    console.error('authReady timed out after 10s; continuing with current auth state');
    _resolveAuthReady();
    _resolveAuthReady = null;
  }
}, 10000);

export function signalAuthReady() {
  if (_resolveAuthReady) {
    _resolveAuthReady();
    _resolveAuthReady = null;
  }
}
