import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkbdoetlyufxobhqvkuf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rYmRvZXRseXVmeG9iaHF2a3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODk2MDYsImV4cCI6MjA4MDE2NTYwNn0.l9bUr-KOd8a5elH3Yb3rRJJIkasBcs7slNPGvYhKRbc';
export const supabase = createClient(supabaseUrl, supabaseKey);
