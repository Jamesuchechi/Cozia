import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

const supabaseUrl =
  (env.VITE_SUPABASE_URL as string) ||
  'https://tjgbbqhoxsgrwvtftauf.supabase.co';

const supabaseAnonKey =
  (env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ2JicWhveHNncnd2dGZ0YXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDMxMTUsImV4cCI6MjEwMTUxOTExNX0.XAqHuCivjEtuWgWd_OubZ23ALPWX_tSsTHoyhpaNu_8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
