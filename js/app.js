class App {
    constructor() {
        this.currentScreen = 'loading';
        this.previousScreen = null;
        this.screenParams = {};
     
        this.init();
    }

    async init() {
        try {
            await baleSDK.init();
            console.log('Bale SDK initialized');
            baleSDK.expand();
            await this.showStore();
        } catch (error) {
            console.error('Failed to initialize SDK:', error);
            this.showError('خطا در راه‌اندازی فروشگاه');
        }
    }

    navigateTo(screen, params = {}) {
        this.previousScreen = this.currentScreen;
        this.currentScreen = screen;
        this.screenParams = params;

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        const screenElement = document.getElementById(`${screen}-screen`);
        if (screenElement) {
            screenElement.classList.add('active');
        }

        if (['product-detail', 'cart', 'checkout'].includes(screen)) {
            baleSDK.enableBackButton();
        } else {
            baleSDK.disableBackButton();
        }

        this.renderScreen(screen, params);
    }

    async renderScreen(screen, params) {
        switch(screen) {
            case 'store':
                await this.showStore();
                break;
            case 'product-detail':
                await this.showProductDetail(params.productId);
                break;
            case 'cart':
                await this.showCart();
                break;
            case 'checkout':
                this.showCheckout();
                break;
        }
    }

    async showStore() {
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('store-screen').classList.add('active');
        
        await store.loadCategories();
        const state = store.getState();
        
        if (state.categories.length > 0) {
            Components.renderCategories(state.categories, state.currentCategory);
            if (!state.currentCategory) {
                const firstCategory = state.categories[0].key;
                await store.loadProducts(firstCategory);
            }
            Components.renderProducts(state.products);
        }
    }

    async showProductDetail(productId) {
        document.getElementById('product-detail-screen').classList.add('active');
        await store.loadProduct(productId);
        const product = store.getState().currentProduct;
        if (product) {
            Components.renderProductDetail(product);
        }
    }

    async showCart() {
        document.getElementById('cart-screen').classList.add('active');
        await store.loadCart();
        Components.renderCart(store.state.cart);
    }

    showCheckout() {
        document.getElementById('checkout-screen').classList.add('active');
        Components.renderCheckoutForm();
    }

    showError(message) {
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('loading-screen').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="font-size: 2rem;">⚠️</p>
                <p style="color: var(--destructive-color);">${message}</p>
                <button class="primary-button" onclick="location.reload()" style="margin-top: 1rem;">
                    تلاش مجدد
                </button>
            </div>
        `;
        document.getElementById('loading-screen').classList.add('active');
    }

    goBack() {
        if (this.currentScreen === 'product-detail') {
            this.navigateTo('store');
        } else if (this.currentScreen === 'cart') {
            this.navigateTo('store');
        } else if (this.currentScreen === 'checkout') {
            this.navigateTo('cart');
        }
    }

    setupGlobalEvents() {
        window.addEventListener('bale-back', () => {
            this.goBack();
        });

        document.getElementById('cart-badge').addEventListener('click', () => {
            this.navigateTo('cart');
        });

        document.querySelectorAll('#back-button, #cart-back-button, #checkout-back-button').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });

        store.subscribe((state) => {
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.textContent = state.cartCount;
                badge.style.display = state.cartCount > 0 ? 'flex' : 'none';
            }
        });
    }
}

const app = new App();

window.addEventListener('DOMContentLoaded', () => {
    app.setupGlobalEvents();
});
