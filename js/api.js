class StoreAPI {
    async loadData() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) throw new Error('فایل data.json پیدا نشد');
            return await response.json();
        } catch (error) {
            console.error('خطا در بارگذاری اطلاعات:', error);
            throw error;
        }
    }

    async getCategories() {
        const data = await this.loadData();
        return data.categories || [];
    }

    async getProducts(category, page = 1) {
        const data = await this.loadData();
        let products = data.products || [];
        if (category) {
            products = products.filter(p => p.category === category);
        }
        const pageSize = 10;
        const start = (page - 1) * pageSize;
        const paginatedProducts = products.slice(start, start + pageSize);
        return {
            products: paginatedProducts,
            total_pages: Math.ceil(products.length / pageSize)
        };
    }

    async getProduct(productId) {
        const data = await this.loadData();
        return (data.products || []).find(p => p.id == productId) || null;
    }

    async addToCart(productId, sizeId, quantity = 1) {
        let cart = JSON.parse(localStorage.getItem('bale_cart') || '[]');
        const existing = cart.find(item => item.product_id === productId && item.size_id === sizeId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            const data = await this.loadData();
            const product = data.products.find(p => p.id == productId);
            const size = product?.sizes?.find(s => s.id == sizeId);
            cart.push({
                product_id: productId,
                size_id: sizeId,
                name: product?.name || 'محصول',
                size_name: size?.size_name || '?',
                base_price: product?.price || 0,
                extra_price: size?.extra_price || 0,
                total_price: ((product?.price || 0) + (size?.extra_price || 0)) * quantity,
                quantity: quantity,
                images: product?.images || []
            });
        }
        localStorage.setItem('bale_cart', JSON.stringify(cart));
        return { success: true };
    }

    async getCart() {
        return JSON.parse(localStorage.getItem('bale_cart') || '[]');
    }

    async checkout(checkoutData) {
        const cart = await this.getCart();
        const total = cart.reduce((sum, item) => sum + item.total_price, 0);
        const order = {
            action: 'place_order',
            user_id: baleSDK.getUser()?.id,
            info: checkoutData,
            items: cart,
            total: total
        };
        baleSDK.webApp.sendData(JSON.stringify(order));
        localStorage.removeItem('bale_cart');
        alert('سفارش شما ثبت شد. لطفاً طبق راهنمایی ربات پرداخت را انجام دهید.');
        baleSDK.webApp.close();
        return { order_id: 'pending' };
    }
}

const api = new StoreAPI();
