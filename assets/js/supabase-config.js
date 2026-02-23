
// Initialize Supabase Client
const SUPABASE_URL = 'url';
const SUPABASE_KEY = 'key';

let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase Initialized');
} else {
    console.error('Supabase SDK not loaded!');
}
