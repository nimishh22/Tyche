/* ==========================================================================
   TYCHE STORE & REACTIVE CART STATE MANAGEMENT
   Dynamic live daily exchange rates & multi-currency calculation engine.
   ========================================================================== */

const DEFAULT_RATES = {
  USD: 1.0,
  GBP: 0.77,
  EUR: 0.92,
  CAD: 1.38,
  AUD: 1.51,
  AED: 3.67,
  SGD: 1.31,
  CNY: 7.12
};

class TycheStore {
  constructor() {
    this.rates = { ...DEFAULT_RATES };
    this.currentRegion = this.detectRegion();
    this.cart = this.loadCart();
    this.activeCategory = 'all';
    this.activeSort = 'featured';
    this.searchQuery = '';
    this.listeners = [];

    // Fetch and sync daily live exchange rates in the background
    this.initDailyRates();
  }

  detectRegion() {
    try {
      const saved = localStorage.getItem('tyche_region');
      if (saved && window.REGIONS && window.REGIONS[saved]) {
        return saved;
      }

      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      if (tz.includes('kolkata') || tz.includes('calcutta') || tz.includes('india')) return 'IN';
      if (tz.includes('london') || tz.includes('belfast')) return 'UK';
      if (tz.includes('berlin') || tz.includes('paris') || tz.includes('amsterdam') || tz.includes('madrid') || tz.includes('rome') || tz.startsWith('europe/')) return 'EU';
      if (tz.includes('toronto') || tz.includes('vancouver') || tz.includes('montreal') || tz.includes('edmonton') || tz.includes('winnipeg') || tz.includes('halifax')) return 'CA';
      if (tz.includes('sydney') || tz.includes('melbourne') || tz.includes('brisbane') || tz.includes('perth') || tz.includes('adelaide') || tz.startsWith('australia/')) return 'AU';
      if (tz.includes('dubai')) return 'AE';
      if (tz.includes('singapore')) return 'SG';
      if (tz.includes('shanghai') || tz.includes('chongqing') || tz.includes('beijing')) return 'CN';
      if (tz.startsWith('america/')) return 'US';
    } catch (e) {
      console.warn('Timezone detection fallback', e);
    }
    return 'IN';
  }

  async initDailyRates() {
    try {
      const cached = localStorage.getItem('tyche_daily_rates_v2');
      const now = Date.now();
      if (cached) {
        const parsed = JSON.parse(cached);
        // Valid for 24 hours
        if (parsed.timestamp && (now - parsed.timestamp < 24 * 60 * 60 * 1000) && parsed.rates) {
          this.rates = { ...DEFAULT_RATES, ...parsed.rates };
          return;
        }
      }

      // Fetch latest daily exchange rates from free open API
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          this.rates = {
            USD: 1.0,
            GBP: data.rates.GBP || DEFAULT_RATES.GBP,
            EUR: data.rates.EUR || DEFAULT_RATES.EUR,
            CAD: data.rates.CAD || DEFAULT_RATES.CAD,
            AUD: data.rates.AUD || DEFAULT_RATES.AUD,
            AED: data.rates.AED || DEFAULT_RATES.AED,
            SGD: data.rates.SGD || DEFAULT_RATES.SGD,
            CNY: data.rates.CNY || DEFAULT_RATES.CNY
          };

          localStorage.setItem('tyche_daily_rates_v2', JSON.stringify({
            timestamp: now,
            rates: this.rates
          }));

          // Notify UI to re-render with fresh daily rates
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Using baseline exchange rates:', err);
    }
  }

  getRegion() {
    const regions = window.REGIONS || {};
    return regions[this.currentRegion] || regions.IN || {
      code: 'IN',
      name: 'India',
      symbol: '₹',
      format: (val) => `₹${Math.round(val)}`,
      shippingThreshold: 2500,
      shippingThresholdText: '₹2,500',
      shippingCost: 99
    };
  }

  setRegion(regionCode) {
    if (!window.REGIONS || !window.REGIONS[regionCode]) return;
    this.currentRegion = regionCode;

    try {
      localStorage.setItem('tyche_region', regionCode);
    } catch (e) {}

    // Recalculate price of all items currently in cart based on new region
    this.cart = this.cart.map(item => ({
      ...item,
      price: this.getProductPrice(item.productId)
    }));

    this.saveCart();
    this.notify();
  }

  /**
   * Calculates the price of ANY current or future product dynamically
   */
  getProductPrice(productId) {
    const product = (window.PRODUCTS || []).find(p => p.id === productId);
    if (!product) return 0;

    // Base INR price (defaults to 1200 if omitted)
    const inr = product.priceINR || product.price || 1200;
    if (this.currentRegion === 'IN') {
      return inr;
    }

    // Base USD target price (defaults to scaling from INR if omitted)
    const baseUSD = product.priceUSD || Math.round((inr / 1200) * 36);
    if (this.currentRegion === 'US') {
      return baseUSD;
    }

    const reg = this.getRegion();
    const rate = (this.rates && this.rates[reg.currency]) || DEFAULT_RATES[reg.currency] || 1.0;
    const converted = baseUSD * rate;

    return Math.round(converted);
  }

  getProductPriceFormatted(productId) {
    const price = this.getProductPrice(productId);
    const reg = this.getRegion();
    return reg.format(price);
  }

  formatPrice(val) {
    const reg = this.getRegion();
    return reg.format(val);
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('tyche_cart_v1');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map(item => ({
        ...item,
        price: this.getProductPrice(item.productId)
      }));
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('tyche_cart_v1', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  addToCart(productId, size = 'M', quantity = 1) {
    const product = (window.PRODUCTS || []).find(p => p.id === productId);
    if (!product) return null;

    const cartItemId = `${productId}-${size}`;
    const price = this.getProductPrice(productId);
    const existingIndex = this.cart.findIndex(item => item.id === cartItemId);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
      this.cart[existingIndex].price = price;
    } else {
      this.cart.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: price,
        size: size,
        color: product.color,
        image: product.images.primary,
        quantity: quantity
      });
    }

    this.saveCart();
    return {
      product,
      size,
      quantity,
      priceFormatted: this.formatPrice(price),
      cartItem: this.cart.find(item => item.id === cartItemId)
    };
  }

  updateQuantity(cartItemId, delta) {
    const index = this.cart.findIndex(item => item.id === cartItemId);
    if (index === -1) return;

    const newQty = this.cart[index].quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(cartItemId);
    } else {
      this.cart[index].quantity = newQty;
      this.saveCart();
    }
  }

  removeFromCart(cartItemId) {
    this.cart = this.cart.filter(item => item.id !== cartItemId);
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingThreshold() {
    const reg = this.getRegion();
    return reg.shippingThreshold;
  }

  getShippingRemaining() {
    const subtotal = this.getCartSubtotal();
    return Math.max(0, this.getShippingThreshold() - subtotal);
  }

  getShippingCost() {
    const subtotal = this.getCartSubtotal();
    if (subtotal === 0) return 0;
    const reg = this.getRegion();
    return subtotal >= reg.shippingThreshold ? 0 : reg.shippingCost;
  }

  getFilteredProducts() {
    let result = [...(window.PRODUCTS || [])];

    if (this.activeCategory !== 'all') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }

    if (this.activeSort === 'price-low') {
      result.sort((a, b) => this.getProductPrice(a.id) - this.getProductPrice(b.id));
    } else if (this.activeSort === 'price-high') {
      result.sort((a, b) => this.getProductPrice(b.id) - this.getProductPrice(a.id));
    }

    return result;
  }
}

// Global store instance
window.store = new TycheStore();
