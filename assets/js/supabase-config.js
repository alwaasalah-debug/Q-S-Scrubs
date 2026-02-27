
// Initialize Supabase Client
const SUPABASE_URL = 'https://wqpowvltghpgrankwttt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_F6rNJKzswf11UH0Pxc8Dzw_VkYIUcvW';

let supabaseClient;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase Initialized');
} else {
    console.error('Supabase SDK not loaded!');
}
