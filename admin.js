// Admin Panel JavaScript
const API_BASE_URL = "https://trustcards.onrender.com";

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.products = [];
        this.users = [];
        this.orders = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
        this.loadProducts();
        this.loadUsers();
        this.loadShippingSettings();
        fetchOrders();
    }

    bindEvents() {
        // Product category filter
        const filter = document.getElementById('product-category-filter');
        if (filter) {
            filter.addEventListener('change', () => this.renderProducts());
        }

        // Shipping form submit
        const shippingForm = document.getElementById("shipping-form");
        if (shippingForm) {
            shippingForm.addEventListener("submit", (e) => this.saveShippingSettings(e));
        }

        // Close modal (clicking × specifically for payments)
        const closeBtn = document.querySelector('#payment-methods-modal .modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const modal = document.getElementById('payment-methods-modal');
                if (modal) modal.style.display = 'none';
            });
        }

        // Add user form
        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }

        // Save content
        const saveContentBtn = document.getElementById('save-content-btn');
        if (saveContentBtn) {
            saveContentBtn.addEventListener('click', () => {
                this.saveContent();
            });
        }

        // Payment methods save
        const paymentForm = document.getElementById('payment-methods-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSettings();
            });
        }

        // Close modal (clicking outside payments modal)
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('payment-methods-modal');
            if (modal && e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar toggle
        const sidebar = document.querySelector('.admin-sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('active');
            });
        }
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            });
        }

        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showModal('add-product-modal');
            });
        }

        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showModal('add-user-modal');
            });
        }

        // Manage payment methods button
        const managePaymentsBtn = document.getElementById('manage-payment-methods-btn');
        if (managePaymentsBtn) {
            managePaymentsBtn.addEventListener('click', async () => {
                const modal = document.getElementById('payment-methods-modal');
                if (modal) modal.style.display = 'block';

                try {
                    const res = await fetch(`${API_BASE_URL}/api/payment-methods`);
                    if (!res.ok) throw new Error("Failed to load payment methods");
                    const data = await res.json();

                    const bankInput = document.getElementById('bank');
                    if (bankInput) bankInput.value = data.bank || '';
                    const paypalInput = document.getElementById('paypal');
                    if (paypalInput) paypalInput.value = data.paypal || '';
                    const skypeInput = document.getElementById('skype');
                    if (skypeInput) skypeInput.value = data.skype || '';
                    const btcInput = document.getElementById('bitcoin');
                    if (btcInput) btcInput.value = data.bitcoin || '';
                    const ethInput = document.getElementById('eth-address');
                    if (ethInput) ethInput.value = data.ethereum || '';
                    const usdtInput = document.getElementById('usdt-address');
                    if (usdtInput) usdtInput.value = data.usdt || '';
                } catch (err) {
                    window.adminPanel.showNotification("Error loading payment methods: " + err.message, "error");
                }
            });
        }

        // Add product form submission
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    }

    showSection(sectionName) 
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.getElementById(sectionName).classList.add('active');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        document.getElementById('page-title').textContent = this.getSectionTitle(sectionName);
        this.currentSection = sectionName;
    
    getSectionTitle(section) 
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Products Management',
            'users': 'User Management',
            'content': 'Site Content',
            'orders': 'Order Management',
            'settings': 'Admin Settings'
        };
     // -------------------
    // PRODUCTS
    // -------------------
    async loadProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            this.products = await res.json();
            this.renderProducts();
        } catch (err) {
            this.showNotification('Error loading products: ' + err.message, 'error');
        }
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        const filter = document.getElementById('product-category-filter');
        let filtered = this.products;

        const normalizeCategory = (cat) =>
            (cat || "").toLowerCase().replace(/\s+/g, "-");

        if (filter && filter.value) {
            const selected = normalizeCategory(filter.value);
            filtered = this.products.filter(p =>
                normalizeCategory(p.category) === selected
            );
        }

        container.innerHTML = filtered.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 220px; height: 220px; object-fit: cover;">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-category">${product.category}</div>
                    <div class="product-review">${product.quickReview || ''}</div>
                    <div class="product-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.editProduct('${product._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary" onclick="adminPanel.deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async addProduct() {
        const form = document.getElementById('add-product-form');
        if (!form) return;
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const formData = new FormData(form);
        if (!formData.get('name') || !formData.get('category') || !formData.get('price') || !formData.get('image')) {
            this.showNotification('Please fill in all required fields.', 'error');
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        formData.append('status', 'active');

        try {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add product');
            }
            this.showNotification('Product added successfully!', 'success');
            await this.loadProducts(); // only call once
            this.updateStats();
            this.hideAllModals();
            form.reset();
        } catch (err) {
            this.showNotification('Error adding product: ' + err.message, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    async editProduct(id) {
        const product = this.products.find(p => p._id === id);
        if (product) {
            this.showNotification('Edit functionality coming soon!', 'info');
        }
    }

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to delete product');
                this.showNotification('Product deleted successfully!', 'success');
                await this.loadProducts();
                this.updateStats();
            } catch (err) {
                this.showNotification('Error deleting product: ' + err.message, 'error');
            }
        }
    }

    // -------------------
    // USERS (unchanged)
    // -------------------
    // ... keep your existing addUser, renderUsers, deleteUser, etc.
async loadUsers() {
        try {
            const res = await fetch(`${API_BASE_URL}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            this.users = await res.json();
            this.renderUsers();
        } catch (err) {
            this.showNotification('Error loading users: ' + err.message, 'error');
        }
    }

    renderUsers() {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="adminPanel.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="adminPanel.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async addUser() {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const user = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            status: 'active'
        };
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (!res.ok) throw new Error('Failed to add user');
            this.showNotification('User added successfully!', 'success');
            await this.loadUsers();
            this.updateStats();
            this.hideAllModals();
            form.reset();
        } catch (err) {
            this.showNotification('Error adding user: ' + err.message, 'error');
        }
    }

    editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.showNotification('Edit functionality coming soon!', 'info');
        }
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== id);
            this.renderUsers();
            this.updateStats();
            this.showNotification('User deleted successfully!', 'success');
        }
    }

    // -------------------
    // SHIPPING
    // -------------------
    async loadShippingSettings() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/shipping`);
            const data = await res.json();
            if (data) {
                document.getElementById("shipping-method").value = data.method || "";
                document.getElementById("shipping-cost").value = data.cost || 0;
                document.getElementById("shipping-estimated").value = data.estimatedDelivery || "";
            }
        } catch (err) {
            console.error("Error loading shipping settings:", err);
        }
    }

    async saveShippingSettings(e) {
        e.preventDefault();
        try {
            const method = document.getElementById("shipping-method").value;
            const cost = parseFloat(document.getElementById("shipping-cost").value);
            const estimatedDelivery = document.getElementById("shipping-estimated").value;

            const res = await fetch(`${API_BASE_URL}/api/shipping`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method, cost, estimatedDelivery })
            });
            if (!res.ok) throw new Error("Failed to update shipping");
            alert("✅ Shipping settings updated!");
        } catch (err) {
            alert("❌ Failed to update shipping: " + err.message);
        }
    }

    // -------------------
    // Notifications, stats, etc. remain same
    // -------------------
 showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }
}

}

// =======================
// ORDERS (fixed cancelOrder bug)
// =======================
async function fetchOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const orders = await res.json();
        window.orders = orders;
        // ... your rendering logic (unchanged)
    } catch (err) {
        console.error("[ERROR] Fetching orders:", err);
    }
}

async function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to delete this order permanently?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {  // ✅ fixed endpoint
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete order");
        alert("✅ Order deleted successfully!");
        fetchOrders();
    } catch (err) {
        alert("❌ Error deleting order: " + err.message);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.adminPanel = new AdminPanel();
    fetchOrders();
});










































