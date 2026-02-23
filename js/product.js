document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const container = document.getElementById('product-container');

    if (!productId) {
        container.innerHTML = '<h2 style="grid-column: 1/-1; text-align: center; color: white;">لم يتم العثور على المنتج.</h2>';
        return;
    }

    try {
        // Fetch product from Supabase
        let product = null;
        if (typeof getProductById === 'function') {
            product = await getProductById(productId);
        }

        if (!product) {
            container.innerHTML = '<h2 style="grid-column: 1/-1; text-align: center; color: white;">المنتج غير موجود.</h2>';
            return;
        }

        renderProductDetails(product, container);

    } catch (error) {
        console.error("Error loading product:", error);
        container.innerHTML = '<h2 style="grid-column: 1/-1; text-align: center; color: white;">حدث خطأ أثناء تحميل المنتج.</h2>';
    }
});

function renderProductDetails(product, container) {
    const hasOffer = product.old_price != null && product.old_price > product.price;
    const oldPriceHTML = hasOffer ? `<span class="old-price">${product.old_price} ج.م</span>` : '';

    // Default sizes if none provided
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
    const sizesHTML = sizes.map((size, index) =>
        `<button class="size-btn ${index === 0 ? 'active' : ''}" data-size="${size}">${size}</button>`
    ).join('');

    const desc = product.details || 'تفاصيل المنتج غير متوفرة حالياً ولكن الخامات المستخدمة هي الأفضل في السوق.';

    // Important: Escape strings for safety
    container.innerHTML = `
        <div class="product-image-section">
            <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/600'">
        </div>
        <div class="product-details-section">
            <h1>${product.name}</h1>
            <div class="price-container">
                <span class="price" style="color: var(--clr-gold);">${product.price} ج.م</span>
                ${oldPriceHTML}
            </div>

            <div class="size-selector">
                <h3>المقاس:</h3>
                <div class="sizes-grid">
                    ${sizesHTML}
                </div>
            </div>

            <div class="actions-container">
                <button class="btn btn-primary btn-large" id="add-to-cart-standalone">أضف إلى السلة</button>
                <button class="share-btn" id="share-btn">
                    <i class="fas fa-share-alt"></i> مشاركة
                </button>
            </div>

            <div class="product-description">
                <h3>تفاصيل المنتج:</h3>
                <p>${desc}</p>
            </div>
        </div>
    `;

    // Handle Size Selection
    const sizeBtns = container.querySelectorAll('.size-btn');
    let selectedSize = sizes[0];

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedSize = e.target.getAttribute('data-size');
        });
    });

    // Handle Add to Cart
    const addToCartBtn = document.getElementById('add-to-cart-standalone');
    addToCartBtn.addEventListener('click', () => {
        // Add specific size to cart. 
        // We modify the addToCart logic slightly to handle sizes if possible, 
        // but for now we'll add a 'size' property to the item in the cart.

        // We need to call a modified addToCart function or do it here
        const existingItem = state.cart.find(item => item.id === product.id && item.size === selectedSize);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            state.cart.push({ ...product, quantity: 1, size: selectedSize });
        }

        saveCartItems(); // from main.js modifications
        updateCartUI(); // from main.js
        showToast(`تمت إضافة ${product.name} (مقاس ${selectedSize}) للسلة`);
    });

    // Handle Share
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: product.name,
            text: `شاهد هذا المنتج الرائع: ${product.name}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showToast("تمت المشاركة بنجاح");
            } catch (err) {
                console.log('Share error:', err);
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast("تم نسخ رابط المنتج");
            } catch (err) {
                showToast("حدث خطأ أثناء نسخ الرابط");
            }
        }
    });
}
