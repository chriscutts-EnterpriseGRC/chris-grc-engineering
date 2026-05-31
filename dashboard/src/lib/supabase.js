import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Returns null when env vars are not set — dashboard falls back to demo data.
export const supabase = (url && key && !url.includes('your-project-id'))
  ? createClient(url, key)
  : null;

export const isLive = Boolean(supabase);
