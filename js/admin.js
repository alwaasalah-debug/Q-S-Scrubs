// Admin state - fetched from Supabase
const adminState = {
    products: [],
    orders: []
};

document.addEventListener('DOMContentLoaded', () => {
    // Basic Login Logic (Frontend only for demo, until Supabase is set up)
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-password').value;

        // Hardcoded dummy login
        if (email === 'admin@qsscrubs.com' && pass === '123456') {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('dashboard-screen').classList.remove('hidden');
            initAdminDashboard();
        } else {
            const errorMsg = document.getElementById('login-error');
            errorMsg.textContent = 'بيانات الدخول غير صحيحة';
            errorMsg.style.display = 'block';
        }
    });
});

async function initAdminDashboard() {
    // Navigation Tabs
    const navItems = document.querySelectorAll('.admin-nav li[data-target]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

            e.currentTarget.classList.add('active');
            const targetId = e.currentTarget.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard-screen').classList.add('hidden');
        document.getElementById('admin-password').value = '';
    });

    // Modals
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('modal-title').textContent = 'إضافة منتج جديد';
        openModal('product-modal');
    });

    // Form Submit
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // Load data from Supabase
    await loadAdminProducts();
    await loadAdminOrders();
}

async function loadAdminProducts() {
    const products = await getProducts();
    adminState.products = products || [];
    renderAdminProducts();
}

async function loadAdminOrders() {
    if (!supabase) {
        adminState.orders = [];
        renderAdminOrders();
        return;
    }
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        adminState.orders = data || [];
    } catch (err) {
        console.error('Error fetching orders:', err);
        adminState.orders = [];
    }
    renderAdminOrders();
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// === PRODUCTS LOGIC ===
function renderAdminProducts() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';

    if (adminState.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد منتجات</td></tr>';
        return;
    }

    adminState.products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.img}" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td>${product.name}</td>
            <td>${product.price} ج.م</td>
            <td>${product.category}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const newProduct = {
        name: document.getElementById('p-name').value,
        price: parseInt(document.getElementById('p-price').value),
        old_price: document.getElementById('p-old-price').value ? parseInt(document.getElementById('p-old-price').value) : null,
        category: document.getElementById('p-category').value,
        img: document.getElementById('p-image').value,
    };

    if (supabase) {
        try {
            if (id) {
                // Update in Supabase
                const { error } = await supabase.from('products').update(newProduct).eq('id', id);
                if (error) throw error;
            } else {
                // Insert into Supabase
                const { error } = await supabase.from('products').insert([newProduct]);
                if (error) throw error;
            }
            await loadAdminProducts();
            closeModal('product-modal');
            alert('تم حفظ المنتج بنجاح');
        } catch (err) {
            console.error('Error saving product:', err);
            alert('حدث خطأ أثناء حفظ المنتج: ' + err.message);
        }
    } else {
        // Fallback: local state only (no DB)
        if (id) {
            const index = adminState.products.findIndex(p => p.id == id);
            if (index !== -1) {
                adminState.products[index] = { ...adminState.products[index], ...newProduct };
            }
        } else {
            newProduct.id = Date.now();
            adminState.products.push(newProduct);
        }
        renderAdminProducts();
        closeModal('product-modal');
        alert('تم حفظ المنتج (محليًا فقط - Supabase غير متصل)');
    }
}

window.editProduct = function (id) {
    const product = adminState.products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-id').value = product.id;
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-old-price').value = product.old_price || '';
    document.getElementById('p-category').value = product.category;
    document.getElementById('p-image').value = product.img;

    document.getElementById('modal-title').textContent = 'تعديل المنتج';
    openModal('product-modal');
}

window.deleteProduct = async function (id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        if (supabase) {
            try {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                await loadAdminProducts();
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('حدث خطأ أثناء حذف المنتج: ' + err.message);
            }
        } else {
            adminState.products = adminState.products.filter(p => p.id !== id);
            renderAdminProducts();
        }
    }
}

// === ORDERS LOGIC ===
function renderAdminOrders() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';

    if (adminState.orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد طلبات</td></tr>';
        return;
    }

    adminState.orders.forEach(order => {
        const tr = document.createElement('tr');
        const statusClass = order.status === 'pending' ? 'status-pending' : 'status-shipped';
        const statusText = order.status === 'pending' ? 'قيد الانتظار' : 'تم الشحن';

        tr.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.created_at}</td>
            <td>${order.customer_info.name}</td>
            <td>${order.total_amount} ج.م</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.viewOrder = function (id) {
    const order = adminState.orders.find(o => o.id === id);
    if (!order) return;

    document.getElementById('view-order-id').textContent = '#' + order.id;

    const content = document.getElementById('order-details-content');
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p><strong>اسم العميل:</strong> ${order.customer_info.name}</p>
            <p><strong>رقم الهاتف:</strong> ${order.customer_info.phone}</p>
            <p><strong>التاريخ:</strong> ${order.created_at}</p>
            <p><strong>الإجمالي:</strong> ${order.total_amount} ج.م</p>
        </div>
        
        <div class="form-group" style="max-width:300px;">
            <label>تحديث حالة الطلب</label>
            <select id="update-order-status" onchange="updateOrderStatus('${order.id}', this.value)">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
            </select>
        </div>
    `;

    openModal('order-modal');
}

window.updateOrderStatus = async function (id, newStatus) {
    if (supabase) {
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            await loadAdminOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('حدث خطأ أثناء تحديث حالة الطلب');
        }
    } else {
        const order = adminState.orders.find(o => o.id === id);
        if (order) {
            order.status = newStatus;
            renderAdminOrders();
        }
    }
}
