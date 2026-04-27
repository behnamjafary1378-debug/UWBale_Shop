class Store {
    constructor() {
        this.state = {
            categories: [],
            currentCategory: null,
            products: [],
            currentProduct: null,
            cart: [],
            cartCount: 0,
            cartTotal: 0,
            selectedBundle: null,
            selectedSize: null,
            selectedColors: [],
            currentPage: 1,
            totalPages: 1,
            isLoading: false,
            error: null,
        };
        this.listeners = new Set();
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    async loadCategories() {
        try {
            const categories = await api.getCategories();
            this.setState({ categories });
        } catch (error) {
            this.setState({ error: 'خطا در بارگذاری دسته‌بندی‌ها' });
        }
    }

    async loadProducts(category, page = 1) {
        this.setState({ isLoading: true, currentCategory: category, currentPage: page });
        try {
            const result = await api.getProducts(category, page);
            this.setState({ 
                products: result.products, 
                totalPages: result.total_pages || 1,
                isLoading: false 
            });
        } catch (error) {
            this.setState({ error: 'خطا در بارگذاری محصولات', isLoading: false });
        }
    }

    async loadProduct(productId) {
        this.setState({ isLoading: true });
        try {
            const product = await api.getProduct(productId);
            this.setState({ currentProduct: product, isLoading: false });
        } catch (error) {
            this.setState({ error: 'خطا در بارگذاری محصول', isLoading: false });
        }
    }

    async loadCart() {
        try {
            const cart = await api.getCart();
            const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartTotal = cart.reduce((sum, item) => sum + item.total_price, 0);
            this.setState({ cart, cartCount, cartTotal });
        } catch (error) {
            this.setState({ error: 'خطا در بارگذاری سبد خرید' });
        }
    }

    async addToCart(productId, sizeId, quantity = 1) {
        try {
            await api.addToCart(productId, sizeId, quantity);
            await this.loadCart();
        } catch (error) {
            this.setState({ error: 'خطا در افزودن به سبد خرید' });
        }
    }
}

const store = new Store();
