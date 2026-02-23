// Shipping Costs Dictionary
const shippingCosts = {
    cairo: 50,
    giza: 50,
    alexandria: 60,
    dakahlia: 70,
    red_sea: 120,
    beheira: 70,
    fayoum: 80,
    gharbia: 70,
    ismailia: 80,
    menofia: 70,
    minya: 90,
    qaliubiya: 60,
    new_valley: 150,
    suez: 80,
    aswan: 120,
    assiut: 100,
    beni_suef: 80,
    port_said: 80,
    damietta: 80,
    sharkia: 70,
    south_sinai: 150,
    kafr_el_sheikh: 70,
    matrouh: 120,
    luxor: 120,
    qena: 110,
    north_sinai: 150,
    sohag: 100
};

let subtotal = 0;
let shippingCost = 0;
let grandTotal = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for state.cart to be hydrated from localStorage by main.js
    setTimeout(renderCheckoutSummary, 100);

    const govSelect = document.getElementById('governorate');
    govSelect.addEventListener('change', (e) => {
        const selectedGov = e.target.value;
        if (shippingCosts[selectedGov] !== undefined) {
            shippingCost = shippingCosts[selectedGov];
            document.getElementById('shipping-price').textContent = `${shippingCost} ج.م`;
        } else {
            shippingCost = 0;
            document.getElementById('shipping-price').textContent = `يحدد لاحقاً`;
        }
        updateGrandTotal();
    });

    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
});

function renderCheckoutSummary() {
    const summaryItemsContainer = document.getElementById('summary-items');

    if (state.cart.length === 0) {
        summaryItemsContainer.innerHTML = '<div style="text-align:center; padding: 20px;">السلة فارغة. يرجى إضافة منتجات لتتمكن من الشراء.</div>';
        document.getElementById('submit-order-btn').disabled = true;
        return;
    }

    summaryItemsContainer.innerHTML = '';
    subtotal = 0;

    state.cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const sizeText = item.size ? `المقاس: ${item.size}` : '';

        const itemEl = document.createElement('div');
        itemEl.className = 'summary-item';
        itemEl.innerHTML = `
            <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70'">
            <div class="summary-item-details">
                <h4>${item.name}</h4>
                <div class="size">${sizeText}</div>
                <div style="font-size: 0.9rem; color: var(--clr-gray-light);">الكمية: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">${item.price * item.quantity} ج.م</div>
        `;
        summaryItemsContainer.appendChild(itemEl);
    });

    document.getElementById('subtotal-price').textContent = `${subtotal} ج.م`;
    updateGrandTotal();
}

function updateGrandTotal() {
    grandTotal = subtotal + shippingCost;
    document.getElementById('grand-total-price').textContent = `${grandTotal} ج.م`;
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    if (state.cart.length === 0) {
        showToast("السلة فارغة!");
        return;
    }

    const btn = document.getElementById('submit-order-btn');
    btn.disabled = true;
    btn.textContent = 'جاري إرسال الطلب...';

    const orderData = {
        full_name: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        governorate: document.getElementById('governorate').options[document.getElementById('governorate').selectedIndex].text,
        address: document.getElementById('address').value,
        notes: document.getElementById('notes').value,
        subtotal: subtotal,
        shipping_price: shippingCost,
        total_price: grandTotal,
        status: 'pending',
        items: state.cart // Store items in JSONB format
    };

    try {
        if (typeof createOrder === 'function') {
            await createOrder(orderData);
        } else {
            // Mock waiting time if function not available
            await new Promise(r => setTimeout(r, 1500));
        }

        // Show Success Overlay
        document.getElementById('success-overlay').classList.add('active');

        // Clear Cart
        state.cart = [];
        if (typeof saveCartItems === 'function') {
            saveCartItems();
        }

    } catch (err) {
        console.error("Error submitting order:", err);
        showToast("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        btn.disabled = false;
        btn.textContent = 'الطلب الآن (الدفع عند الاستلام)';
    }
}
