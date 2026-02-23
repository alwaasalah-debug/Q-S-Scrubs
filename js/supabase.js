/* 
    Supabase Configuration File
    ===========================
    1. Fill out SUPABASE_URL and SUPABASE_ANON_KEY from your project settings.
    2. Ensure supabase exists by including `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
*/

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

let supabase;

if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized.");
} else {
    console.warn("Supabase logic initialized but waiting for valid User Keys to connect safely. Using mock data in the meantime if applicable.");
}

// Fetch all products
async function getProducts() {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching products:", err);
        return null;
    }
}

// Fetch single product
async function getProductById(id) {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error fetching product:", err);
        return null;
    }
}

// Create a new order
async function createOrder(orderData) {
    if (!supabase) {
        console.warn("Supabase not connected. Order would be:", orderData);
        // Simulate a network delay for the mock
        return new Promise(resolve => setTimeout(() => resolve({ success: true, mock: true }), 1500));
    }
    try {
        const { data, error } = await supabase.from('orders').insert([orderData]);
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Error creating order:", err);
        throw err;
    }
}
