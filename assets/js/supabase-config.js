
// Initialize Supabase Client
const SUPABASE_URL = 'https://egkgdesgdykaapbaultd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_F8lrCQU-4eA_X2pdMLW-Mg_V4FnDqfk';

let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase Initialized');
} else {
    console.error('Supabase SDK not loaded!');
}
