// Configuration & State
const state = {
    cart: [],
    products: []
};

// Elements
const elements = {
    menuBtn: document.getElementById('menu-btn'),
    closeMenuBtn: document.getElementById('close-menu-btn'),
    sidebarMenu: document.getElementById('sidebar-menu'),
    menuOverlay: document.getElementById('menu-overlay'),

    cartBtn: document.getElementById('cart-btn'),
    closeCartBtn: document.getElementById('close-cart-btn'),
    miniCart: document.getElementById('mini-cart'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartBadge: document.getElementById('cart-badge'),

    searchBtn: document.getElementById('search-btn'),
    closeSearchBtn: document.getElementById('close-search-btn'),
    searchOverlay: document.getElementById('search-overlay'),

    sliderContainer: document.getElementById('slider-container'),
    prevBtn: document.querySelector('.prev-btn'),
    nextBtn: document.querySelector('.next-btn'),

    productsGrid: document.getElementById('products-grid'),
    filterBtns: document.querySelectorAll('.filter-btn'),

    toastContainer: document.getElementById('toast-container')
};

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initSlider();
    loadProducts(); // Load initial products (mock or supabase)
    loadCartItems(); // Load cart from localStorage
});

// === UI Interactions (Modals, Overlays) ===
function initUI() {
    // Mobile Menu
    if (elements.menuBtn) elements.menuBtn.addEventListener('click', () => toggleModal(elements.sidebarMenu, elements.menuOverlay));
    if (elements.closeMenuBtn) elements.closeMenuBtn.addEventListener('click', () => toggleModal(elements.sidebarMenu, elements.menuOverlay));
    if (elements.menuOverlay) elements.menuOverlay.addEventListener('click', () => toggleModal(elements.sidebarMenu, elements.menuOverlay));

    // Mini Cart
    if (elements.cartBtn) elements.cartBtn.addEventListener('click', () => toggleModal(elements.miniCart, elements.cartOverlay));
    if (elements.closeCartBtn) elements.closeCartBtn.addEventListener('click', () => toggleModal(elements.miniCart, elements.cartOverlay));
    if (elements.cartOverlay) elements.cartOverlay.addEventListener('click', () => toggleModal(elements.miniCart, elements.cartOverlay));

    const continueShoppingBtn = document.getElementById('continue-shopping');
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', () => toggleModal(elements.miniCart, elements.cartOverlay));

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    // Search Overlay
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', () => {
            if (elements.searchOverlay) elements.searchOverlay.classList.add('active');
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        });
    }
    if (elements.closeSearchBtn) elements.closeSearchBtn.addEventListener('click', () => elements.searchOverlay.classList.remove('active'));

    // Category Filters
    if (elements.filterBtns) {
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                filterProducts(e.target.dataset.filter);
            });
        });
    }
}

function toggleModal(modal, overlay) {
    if (modal) modal.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// === Hero Slider ===
let currentSlide = 0;
let slideInterval;

function initSlider() {
    if (!elements.sliderContainer) return;
    const slides = elements.sliderContainer.querySelectorAll('.slide');
    if (slides.length === 0) return;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    };

    if (elements.nextBtn) elements.nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
    if (elements.prevBtn) elements.prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

    const resetInterval = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    };

    resetInterval();
}

// === Product Rendering & Filtering ===
async function loadProducts() {
    // Fetch products from Supabase database
    const products = await getProducts();
    if (products && products.length > 0) {
        state.products = products;
    } else {
        state.products = [];
        console.warn('لا توجد منتجات في قاعدة البيانات أو Supabase غير متصل.');
    }

    renderProducts(state.products);
    buildCategoryFilters();
}

function buildCategoryFilters() {
    const filtersContainer = document.getElementById('product-filters');
    if (!filtersContainer) return;

    // Get unique categories from products
    const categories = [...new Set(state.products.map(p => p.category).filter(Boolean))];

    // Find the offers button to insert category buttons before it
    const offersBtn = filtersContainer.querySelector('[data-filter="offers"]');

    // Remove any previously generated category buttons
    filtersContainer.querySelectorAll('.filter-btn[data-dynamic]').forEach(btn => btn.remove());

    // Create a button for each unique category
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', cat);
        btn.setAttribute('data-dynamic', 'true');
        btn.textContent = cat;
        filtersContainer.insertBefore(btn, offersBtn);
    });

    // Re-attach filter event listeners
    const allFilterBtns = filtersContainer.querySelectorAll('.filter-btn');
    allFilterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            allFilterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(e.target.dataset.filter);
        });
    });
}

function renderProducts(productsToRender) {
    if (!elements.productsGrid) return;
    elements.productsGrid.innerHTML = '';

    if (productsToRender.length === 0) {
        elements.productsGrid.innerHTML = '<p>لا توجد منتجات مطابقة.</p>';
        return;
    }

    productsToRender.forEach(product => {
        const hasOffer = product.old_price != null && product.old_price > product.price;
        const badgeHTML = hasOffer ? `<div class="product-badge">عرض خاص</div>` : '';
        const oldPriceHTML = hasOffer ? `<span class="old-price">${product.old_price} ج.م</span>` : '';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
                ${badgeHTML}
                <div class="product-img">
                    <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500'">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price">${product.price} ج.م</span>
                        ${oldPriceHTML}
                    </div>
                </div>
            </a>
        `;
        elements.productsGrid.appendChild(card);
    });
}

function filterProducts(filter) {
    let filtered = state.products;
    if (filter === 'offers') {
        filtered = state.products.filter(p => p.old_price != null && p.old_price > p.price);
    } else if (filter && filter !== 'all') {
        filtered = state.products.filter(p => p.category === filter);
    }
    renderProducts(filtered);
}

// === Cart Functionality ===
function loadCartItems() {
    const savedCart = localStorage.getItem('qns_cart');
    if (savedCart) {
        try {
            state.cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Error parsing cart data", e);
            state.cart = [];
        }
    }
    updateCartUI();
}

function saveCartItems() {
    localStorage.setItem('qns_cart', JSON.stringify(state.cart));
}
function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }

    saveCartItems();
    updateCartUI();
    showToast(`تمت إضافة ${product.name} للسلة`);
}

function removeFromCart(productId, size = null) {
    if (size) {
        state.cart = state.cart.filter(item => !(item.id === productId && item.size === size));
    } else {
        state.cart = state.cart.filter(item => item.id !== productId);
    }
    saveCartItems();
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('mini-cart-items');
    const badge = elements.cartBadge;
    const totalEl = document.getElementById('cart-total-price');

    // Update Badge
    if (badge) {
        const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalQuantity;
    }

    if (!cartItemsContainer || !totalEl) return;

    // Render Items
    if (state.cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg" style="text-align:center; padding: 20px;">السلة فارغة حاليا</div>';
        totalEl.textContent = '0 ج.م';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    state.cart.forEach(item => {
        total += item.price * item.quantity;

        const itemEl = document.createElement('div');
        itemEl.style.display = 'flex';
        itemEl.style.alignItems = 'center';
        itemEl.style.gap = '15px';
        itemEl.style.marginBottom = '15px';
        itemEl.style.paddingBottom = '15px';
        itemEl.style.borderBottom = '1px solid var(--clr-gray-dark)';

        const sizeText = item.size ? `(مقاس: ${item.size})` : '';
        itemEl.innerHTML = `
            <img src="${item.img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/60'">
            <div style="flex-grow: 1;">
                <h4 style="font-size: 14px; margin-bottom: 5px;">${item.name} <span style="font-size: 12px; color: var(--clr-gray);">${sizeText}</span></h4>
                <div style="color: var(--clr-gold);">${item.price} ج.م × ${item.quantity}</div>
            </div>
            <button onclick="removeFromCart(${item.id}, '${item.size || ''}')" style="background: none; border: none; color: var(--clr-gray); cursor: pointer;"><i class="fas fa-trash"></i></button>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    totalEl.textContent = `${total} ج.م`;
}

// === Toast Notifications ===
function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
