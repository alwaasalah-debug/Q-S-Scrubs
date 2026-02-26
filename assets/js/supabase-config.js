
// Initialize Supabase Client
const SUPABASE_URL = 'https://ueipfgllngdubiioqrbc.supabase.co';
const SUPABASE_KEY = 'sb_secret_7yZnSuH7VqYJNo5PaUeS6A_BlYdGC1-';

let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase Initialized');
} else {
    console.error('Supabase SDK not loaded!');
}
