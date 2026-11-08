// Shared configuration. Safe to import from browser code: only public values
// (Supabase URL and publishable key) live here; secrets are read from
// process.env inside the server-only modules that need them.

const DEFAULT_SUPABASE_URL = "https://wzkqjeejgrolkdkywovp.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_WxtFdrwndFYgyhC6E0hdzw_pSxquJcl";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
