
// Initialize Supabase Client
const SUPABASE_URL = 'https://nuaoqnpbznmtxnqxvbrf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Fz2i5AtO7dViuuwFnHcZXg_PPiTkskd';

let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase Initialized');
} else {
    console.error('Supabase SDK not loaded!');
}
