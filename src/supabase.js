import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkbexcyicptyfkgwdhtg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprYmV4Y3lpY3B0eWZrZ3dkaHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Mzk5NjMsImV4cCI6MjA4MDMxNTk2M30.WFyR2sxJ5aAWUC8006h_JcULC7-cNP1MTZi6Xy8tlps';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
