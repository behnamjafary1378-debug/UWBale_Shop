class Components {
    static renderCategories(categories, currentCategory) {
        const container = document.getElementById('category-tabs');
        if (!container) return;

        container.innerHTML = categories.map(cat => `
            <div class="category-tab ${cat.key === currentCategory ? 'active' : ''}"
                 data-category="${cat.key}">
                ${cat.emoji} ${cat.name}
            </div>
        `).join('');

        container.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                store.loadProducts(category);
            });
        });
    }

    static renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1 / -1; padding: 2rem;">
                    <p>😔 محصولی در این دسته وجود ندارد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <img class="product-image" 
                     src="${product.images[0] || 'placeholder.jpg'}" 
                     alt="${product.name}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjJmMmY3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzhlOGU5MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} تومان</div>
                    ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                    ${product.colors ? `
                        <div class="product-colors">
                            ${product.colors.slice(0, 3).map(c => 
                                `<span class="color-badge">${c.color_name}</span>`
                            ).join('')}
                            ${product.colors.length > 3 ? 
                                `<span class="color-badge">+${product.colors.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                app.navigateTo('product-detail', { productId });
            });
        });
    }

    static renderProductDetail(product) {
        const container = document.getElementById('product-detail-content');
        if (!container || !product) return;

        document.getElementById('detail-title').textContent = product.name;

        container.innerHTML = `
            <div class="image-gallery">
                ${product.images.map(img => `
                    <img class="gallery-image" src="${img}" alt="${product.name}" 
                         onerror="this.src='placeholder.jpg'">
                `).join('')}
            </div>
            
            <div class="detail-info">
                <div class="detail-name">${product.name}</div>
                <div class="detail-price">${product.price.toLocaleString()} تومان</div>
                ${product.description ? `<p style="margin-top: 1rem; color: var(--hint-color)">${product.description}</p>` : ''}
            </div>

            ${product.bundles?.length ? `
                <div class="bundle-options">
                    <h3 style="margin-bottom: 1rem;">📦 طرح‌های فروش</h3>
                    ${product.bundles.map(bundle => `
                        <div class="bundle-option" data-bundle-id="${bundle.id}">
                            <strong>${bundle.quantity} عدد - ${Components.getRuleText(bundle)}</strong>
                            <div style="color: var(--button-color); margin-top: 0.5rem;">
                                ${bundle.total_price.toLocaleString()} تومان
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${product.sizes?.length ? `
                <div class="size-selection">
                    <h3 style="width: 100%; margin-bottom: 0.5rem;">📏 سایز</h3>
                    ${product.sizes.map(size => `
                        <div class="size-button" data-size-id="${size.id}">
                            ${size.size_name}
                            ${size.extra_price ? ` (+${size.extra_price.toLocaleString()})` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="margin: 1.5rem 0;">
                <button class="primary-button" id="add-to-cart-btn" disabled>
                    افزودن به سبد خرید 🛒
                </button>
            </div>
        `;

        this.setupProductDetailEvents(product);
    }

    static getRuleText(bundle) {
        const ruleMap = {
            'free_all': 'انتخاب آزاد همه رنگ‌ها',
            'limited_free': `انتخاب ${bundle.limited_count} رنگ آزاد`,
            'random_all': 'رنگ‌های تصادفی',
        };
        return ruleMap[bundle.rule_type] || bundle.rule_type;
    }

    static setupProductDetailEvents(product) {
        const container = document.getElementById('product-detail-content');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        let selectedBundle = null;
        let selectedSize = null;

        container.querySelectorAll('.bundle-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.bundle-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedBundle = product.bundles.find(b => b.id == option.dataset.bundleId);
                this.updateAddToCartButton(addToCartBtn, selectedBundle, selectedSize);
            });
        });

        container.querySelectorAll('.size-button').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.size-button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedSize = product.sizes.find(s => s.id == btn.dataset.sizeId);
                this.updateAddToCartButton(addToCartBtn, selectedBundle, selectedSize);
            });
        });

        addToCartBtn.addEventListener('click', async () => {
            if (selectedBundle && selectedSize) {
                await store.addToCart(product.id, selectedSize.id, 1);
                alert('محصول به سبد خرید اضافه شد');
                app.navigateTo('cart');
            }
        });
    }

    static updateAddToCartButton(btn, bundle, size) {
        const enabled = !!(bundle && size);
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? '1' : '0.5';
    }

    static renderCart(cart) {
        const container = document.getElementById('cart-content');
        const footer = document.getElementById('cart-footer');

        if (!cart || cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <p style="font-size: 2rem;">🛒</p>
                    <p>سبد خرید خالی است</p>
                    <button class="secondary-button" style="margin-top: 1rem;" onclick="app.navigateTo('store')">
                        شروع خرید
                    </button>
                </div>
            `;
            footer.innerHTML = '';
            return;
        }

        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-image" src="${item.images?.[0] || 'placeholder.jpg'}" alt="${item.name}"
                     onerror="this.src='placeholder.jpg'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div style="color: var(--hint-color); font-size: 0.9rem;">سایز: ${item.size_name}</div>
                    <div class="cart-item-price">${item.total_price.toLocaleString()} تومان</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-button" data-action="dec" data-product-id="${item.product_id}" data-size-id="${item.size_id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-button" data-action="inc" data-product-id="${item.product_id}" data-size-id="${item.size_id}">+</button>
                    <button class="icon-button" data-action="remove" data-product-id="${item.product_id}" data-size-id="${item.size_id}">🗑</button>
                </div>
            </div>
        `).join('');

        footer.innerHTML = `
            <div class="cart-total">💰 جمع کل: ${store.state.cartTotal.toLocaleString()} تومان</div>
            <button class="primary-button" id="checkout-btn">تکمیل خرید ✅</button>
        `;

        this.setupCartEvents();
    }

    static setupCartEvents() {
        document.querySelectorAll('[data-action="inc"], [data-action="dec"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const productId = parseInt(btn.dataset.productId);
                const sizeId = parseInt(btn.dataset.sizeId);
                const change = btn.dataset.action === 'inc' ? 1 : -1;
                await api.addToCart(productId, sizeId, change);
                await store.loadCart();
                Components.renderCart(store.state.cart);
            });
        });

        document.querySelectorAll('[data-action="remove"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const productId = parseInt(btn.dataset.productId);
                const sizeId = parseInt(btn.dataset.sizeId);
                if (confirm('از حذف این آیتم مطمئن هستید؟')) {
                    let cart = JSON.parse(localStorage.getItem('bale_cart') || '[]');
                    cart = cart.filter(item => !(item.product_id === productId && item.size_id === sizeId));
                    localStorage.setItem('bale_cart', JSON.stringify(cart));
                    await store.loadCart();
                    Components.renderCart(store.state.cart);
                }
            });
        });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                app.navigateTo('checkout');
            });
        }
    }

    static renderCheckoutForm() {
        const container = document.getElementById('checkout-form');
        if (!container) return;

        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">نام و نام خانوادگی *</label>
                <input class="form-input" type="text" id="checkout-name" required 
                       placeholder="نام کامل خود را وارد کنید">
            </div>
            
            <div class="form-group">
                <label class="form-label">شماره تلفن *</label>
                <input class="form-input" type="tel" id="checkout-phone" required 
                       placeholder="09xxxxxxxxx" pattern="09[0-9]{9}">
            </div>
            
            <div class="form-group">
                <label class="form-label">آدرس *</label>
                <textarea class="form-input" id="checkout-address" required 
                          rows="3" placeholder="آدرس کامل خود را وارد کنید"></textarea>
            </div>
            
            <div style="margin: 2rem 0;">
                <button class="primary-button" type="submit">ثبت سفارش و پرداخت 💳</button>
            </div>
            
            <div style="text-align: center;">
                <button class="secondary-button" type="button" onclick="app.navigateTo('cart')">
                    بازگشت به سبد خرید
                </button>
            </div>
        `;

        container.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const checkoutData = {
                full_name: document.getElementById('checkout-name').value,
                phone: document.getElementById('checkout-phone').value,
                address: document.getElementById('checkout-address').value,
            };
            
            try {
                await api.checkout(checkoutData);
            } catch (error) {
                alert('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
            }
        });
    }
}
