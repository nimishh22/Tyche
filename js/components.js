/* ==========================================================================
   TYCHE UI COMPONENTS & RENDERING ENGINE
   Multi-currency & regional pricing support.
   ========================================================================== */

const UI = {
  /**
   * Set & sync customer region/currency
   */
  setRegion(regionCode) {
    window.store.setRegion(regionCode);
    this.syncRegionUI();
    this.renderFeaturedCarousel();
    this.renderCollectionGrid();
    this.renderCartDrawer();
    this.refreshAllPrices();
  },

  refreshAllPrices() {
    const reg = window.store.getRegion();

    // Directly update all price labels across the DOM (cards, tiles, modal)
    document.querySelectorAll('[data-product-price]').forEach(el => {
      const pid = el.getAttribute('data-product-price');
      if (pid) {
        el.textContent = window.store.getProductPriceFormatted(pid);
      }
    });

    // Free shipping threshold in header announcement
    const annMsg = document.getElementById('announcement-shipping-msg');
    if (annMsg) {
      annMsg.textContent = `FREE SHIPPING OVER ${reg.shippingThresholdText}`;
    }

    // Checkout summary if active
    if (document.getElementById('checkout-view')?.classList.contains('active')) {
      this.renderCheckoutSummary();
    }

    // If detail modal is open, refresh displayed prices
    const activeModal = document.getElementById('product-modal');
    if (activeModal && activeModal.classList.contains('active')) {
      const hash = window.location.hash;
      if (hash.startsWith('#product/')) {
        const pid = hash.replace('#product/', '');
        const formatted = window.store.getProductPriceFormatted(pid);
        const priceEl = document.querySelector('.artofclo-price');
        const btnPriceEl = document.getElementById('modal-btn-price');
        if (priceEl) priceEl.textContent = formatted;
        if (btnPriceEl) btnPriceEl.textContent = formatted;
      }
    }
  },

  syncRegionUI() {
    const reg = window.store.getRegion();
    const selector = document.getElementById('region-selector');
    if (selector && selector.value !== reg.code) {
      selector.value = reg.code;
    }
    const chkCountry = document.getElementById('chk-country');
    if (chkCountry && chkCountry.value !== reg.code) {
      chkCountry.value = reg.code;
    }

    const annMsg = document.getElementById('announcement-shipping-msg');
    if (annMsg) {
      annMsg.textContent = `FREE SHIPPING OVER ${reg.shippingThresholdText}`;
    }
  },

  /**
   * Renders a single product card with hover image-swap & localized price
   */
  createProductCard(product, index = 0) {
    const card = document.createElement('div');
    card.className = `product-card stagger-${(index % 6) + 1}`;
    card.setAttribute('data-reveal', 'pop-in');
    card.setAttribute('data-id', product.id);

    const badgeHtml = product.badge 
      ? `<span class="product-tag ${product.badgeType || ''}">${product.badge}</span>` 
      : '';

    const priceFormatted = window.store.getProductPriceFormatted(product.id);

    card.innerHTML = `
      <div class="product-media" onclick="UI.openProductModal('${product.id}')" role="button" tabindex="0" aria-label="View ${product.name}">
        <div class="product-card-tags">
          ${badgeHtml}
        </div>
        <img class="product-img primary" src="${product.images.primary}" alt="${product.name} - Front View" loading="lazy">
        <img class="product-img secondary" src="${product.images.secondary}" alt="${product.name} - Alternate Angle" loading="lazy">
        <div class="product-quick-actions" onclick="event.stopPropagation()">
          <button class="quick-add-btn" onclick="UI.openProductModal('${product.id}')" aria-label="Quick preview ${product.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Quick View
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-cat-label">${product.categoryLabel}</span>
        <a href="javascript:void(0)" class="product-title" onclick="UI.openProductModal('${product.id}')">
          ${product.name}
        </a>
        <div class="product-price-row">
          <span class="price-label">Price</span>
          <span class="price-value" data-product-price="${product.id}">${priceFormatted}</span>
        </div>
      </div>
    `;

    return card;
  },

  /**
   * Renders the featured product carousel
   */
  renderFeaturedCarousel() {
    const track = document.getElementById('featured-carousel-track');
    if (!track) return;

    track.innerHTML = '';
    const catalog = window.PRODUCTS || (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    const featured = catalog.filter(p => p.isFeatured);

    featured.forEach((product, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'product-carousel-item';
      wrapper.appendChild(this.createProductCard(product, i));
      track.appendChild(wrapper);
    });

    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (prevBtn && nextBtn) {
      prevBtn.onclick = () => {
        track.scrollBy({ left: -320, behavior: 'smooth' });
      };
      nextBtn.onclick = () => {
        track.scrollBy({ left: 320, behavior: 'smooth' });
      };
    }
  },

  /**
   * Renders the collection / shop grid
   */
  renderCollectionGrid() {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const products = window.store.getFilteredProducts();

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; border: 1px solid var(--border-hairline); background: var(--bg-secondary);">
          <p style="font-size: 1.2rem; font-family: var(--font-serif-title); text-transform: uppercase; color: var(--text-primary); margin-bottom: 0.5rem;">No tees match your filter</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Try clearing your search query or selecting a different tab.</p>
          <button class="btn-primary" style="margin-top: 1.5rem;" onclick="UI.setCategory('all')">View All Tees</button>
        </div>
      `;
      return;
    }

    products.forEach((product, i) => {
      grid.appendChild(this.createProductCard(product, i));
    });

    if (window.motion) {
      window.motion.refresh();
    }
  },

  /**
   * Category Filter Tab Controller
   */
  setCategory(category) {
    window.store.activeCategory = category;
    
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      const cat = link.getAttribute('data-nav-category');
      if (cat && cat === category) {
        link.classList.add('active');
      } else if (cat) {
        link.classList.remove('active');
      }
    });

    this.renderCollectionGrid();

    const collectionSec = document.getElementById('collection-section');
    if (collectionSec && window.scrollY > 400) {
      collectionSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  /**
   * Product Modal & Preview Page
   */
  openProductModal(productId) {
    const catalog = window.PRODUCTS || (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    const product = catalog.find(p => p.id === productId);
    if (!product) return;

    window._selectedModalSize = 'M';
    window._selectedModalQty = 1;

    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('product-modal-body');
    if (!modal || !modalBody) return;

    window.location.hash = `product/${product.id}`;
    const priceFormatted = window.store.getProductPriceFormatted(product.id);
    const reg = window.store.getRegion();

    modalBody.innerHTML = `
      <div class="product-detail-modal artofclo-modal-view">
        <button class="modal-close-btn" onclick="UI.closeProductModal()" aria-label="Close product view">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Left Column: Media Gallery -->
        <div class="artofclo-gallery">
          <div class="artofclo-main-media-wrap">
            <img id="detail-active-img" class="artofclo-main-img" src="${product.images.primary}" alt="${product.name}">
            <button class="artofclo-gallery-zoom-hint" onclick="UI.toggleImageZoom()" type="button" aria-label="Enlarge image">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>Enlarge</span>
            </button>
          </div>

          <div class="artofclo-thumbs-strip">
            ${product.images.gallery.map((imgUrl, i) => `
              <button class="artofclo-thumb-item ${i === 0 ? 'active' : ''}" onclick="UI.switchModalImage('${imgUrl}', this)" aria-label="View photo angle ${i + 1}">
                <img src="${imgUrl}" alt="${product.name} angle ${i + 1}" loading="lazy">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Right Column: Sticky Product Info -->
        <div class="artofclo-info-column">
          <!-- Breadcrumb Hierarchy -->
          <div class="artofclo-breadcrumbs">
            <a href="javascript:void(0)" onclick="UI.closeProductModal()">TYCHE</a>
            <span class="sep">/</span>
            <span class="cat">DROP 01</span>
            <span class="sep">/</span>
            <span class="current">${product.color.toUpperCase()}</span>
          </div>

          <!-- Editorial Headline -->
          <h1 class="artofclo-product-title">${product.name}</h1>

          <!-- Price & Tax Note -->
          <div class="artofclo-price-box">
            <span class="artofclo-price" data-product-price="${product.id}">${priceFormatted}</span>
            <span class="artofclo-tax-tag">Taxes included. Tracked shipping calculated at checkout.</span>
          </div>

          <!-- Stock Status Badge -->
          <div class="artofclo-stock-status">
            <span class="stock-dot"></span>
            <span>In stock. Ready to dispatch within 24–48 hours.</span>
          </div>

          <!-- Size Variant Selection -->
          <div class="artofclo-variant-section">
            <div class="variant-header-row">
              <span class="variant-label">SIZE: <strong id="selected-size-label">M</strong></span>
              <button class="artofclo-link-btn" onclick="UI.openSizeGuide()" type="button">SIZE GUIDE</button>
            </div>
            <div class="artofclo-pills-row" role="radiogroup" aria-label="Size Options">
              ${product.sizes.map(s => `
                <button class="artofclo-pill ${s === 'M' ? 'active' : ''}" onclick="UI.selectSize('${s}', this)" role="radio" aria-checked="${s === 'M'}" type="button">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div class="artofclo-quantity-section">
            <span class="variant-label">QUANTITY</span>
            <div class="artofclo-qty-stepper">
              <button type="button" class="qty-step-btn" onclick="UI.changeModalQty(-1)" aria-label="Decrease quantity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <span id="modal-qty-val" class="qty-val-display">1</span>
              <button type="button" class="qty-step-btn" onclick="UI.changeModalQty(1)" aria-label="Increase quantity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>

          <!-- Purchase Action Buttons -->
          <div class="artofclo-cta-stack">
            <button id="modal-add-btn" class="artofclo-btn-cart" onclick="UI.addToBagFromModal('${product.id}')" type="button">
              <span>ADD TO BAG</span>
              <span class="btn-dot">•</span>
              <span id="modal-btn-price" data-product-price="${product.id}">${priceFormatted}</span>
            </button>
            <button class="artofclo-btn-buy" onclick="UI.buyItNow('${product.id}')" type="button">
              BUY IT NOW
            </button>
          </div>

          <!-- Collapsible Accordion Tabs -->
          <div class="artofclo-accordions">
            <!-- 1. Description & Notes -->
            <div class="artofclo-accordion-item open">
              <button class="artofclo-accordion-trigger" onclick="UI.toggleAccordion(this)" type="button">
                <span>DETAILS & GRAPHICS</span>
                <span class="accordion-icon"></span>
              </button>
              <div class="artofclo-accordion-content">
                <div class="accordion-inner">
                  <p>${product.description}</p>
                </div>
              </div>
            </div>

            <!-- 2. Fabrication & Specifications -->
            <div class="artofclo-accordion-item">
              <button class="artofclo-accordion-trigger" onclick="UI.toggleAccordion(this)" type="button">
                <span>FABRIC & SPECS</span>
                <span class="accordion-icon"></span>
              </button>
              <div class="artofclo-accordion-content">
                <div class="accordion-inner">
                  <div class="spec-grid">
                    ${Object.entries(product.specs).map(([key, val]) => `
                      <div class="spec-row">
                        <span class="spec-k">${key}</span>
                        <span class="spec-v">${val}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Care Instructions -->
            <div class="artofclo-accordion-item">
              <button class="artofclo-accordion-trigger" onclick="UI.toggleAccordion(this)" type="button">
                <span>CARE INSTRUCTIONS</span>
                <span class="accordion-icon"></span>
              </button>
              <div class="artofclo-accordion-content">
                <div class="accordion-inner">
                  <ul class="care-list">
                    <li>Machine wash cold at 30°C (gentle cycle) inside out</li>
                    <li>Wash with similar dark tones</li>
                    <li>Do not bleach or tumble dry</li>
                    <li>Cool iron inside out (never iron directly over screenprints)</li>
                    <li>Hang dry in shade to preserve fit and print longevity</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 4. Shipping & Returns -->
            <div class="artofclo-accordion-item">
              <button class="artofclo-accordion-trigger" onclick="UI.toggleAccordion(this)" type="button">
                <span>SHIPPING & RETURNS</span>
                <span class="accordion-icon"></span>
              </button>
              <div class="artofclo-accordion-content">
                <div class="accordion-inner">
                  <p><strong>Dispatch:</strong> Orders dispatched within 24–48 hours with door-to-door tracking.</p>
                  <p style="margin-top: 0.5rem;"><strong>Free Shipping:</strong> Automatically applied to orders over ${reg.shippingThresholdText}.</p>
                  <p style="margin-top: 0.5rem;"><strong>14-Day Returns:</strong> Unworn items with original tags qualify for straightforward returns or exchanges.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (window.location.hash.startsWith('#product/')) {
        history.replaceState(null, null, ' ');
      }
    }
  },

  switchModalImage(url, btn) {
    const mainImg = document.getElementById('detail-active-img');
    if (mainImg) {
      mainImg.style.opacity = '0.35';
      setTimeout(() => {
        mainImg.src = url;
        mainImg.style.opacity = '1';
      }, 120);
    }
    document.querySelectorAll('.artofclo-thumb-item').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  selectSize(size, btn) {
    window._selectedModalSize = size;
    const label = document.getElementById('selected-size-label');
    if (label) label.textContent = size;

    document.querySelectorAll('.artofclo-pill').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
    }
  },

  changeModalQty(delta) {
    window._selectedModalQty = Math.max(1, (window._selectedModalQty || 1) + delta);
    const qtyDisplay = document.getElementById('modal-qty-val');
    if (qtyDisplay) qtyDisplay.textContent = window._selectedModalQty;
  },

  toggleAccordion(btn) {
    const item = btn.closest('.artofclo-accordion-item');
    if (!item) return;
    item.classList.toggle('open');
  },

  toggleImageZoom() {
    const mainImg = document.getElementById('detail-active-img');
    if (mainImg) {
      mainImg.classList.toggle('zoomed');
    }
  },

  addToBagFromModal(productId) {
    const size = window._selectedModalSize || 'M';
    const qty = window._selectedModalQty || 1;
    const result = window.store.addToCart(productId, size, qty);
    if (result) {
      this.closeProductModal();
      this.showToast(result);
    }
  },

  buyItNow(productId) {
    const size = window._selectedModalSize || 'M';
    const qty = window._selectedModalQty || 1;
    window.store.addToCart(productId, size, qty);
    this.closeProductModal();
    this.openCheckout();
  },

  quickAdd(productId) {
    const result = window.store.addToCart(productId, 'M', 1);
    if (result) {
      this.showToast(result);
    }
  },

  /**
   * Toast Notification
   */
  showToast(cartData) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <div class="toast-header">
        <span style="display: flex; align-items: center; gap: 0.4rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Added to your bag
        </span>
        <button onclick="this.closest('.toast-item').remove()" style="color: var(--text-muted); font-size: 1rem;">✕</button>
      </div>
      <div class="toast-body">
        <img class="toast-thumb" src="${cartData.product.images.primary}" alt="${cartData.product.name}">
        <div class="toast-info">
          <span class="toast-title">${cartData.product.name}</span>
          <span class="toast-meta">Size: ${cartData.size} / ${cartData.priceFormatted || window.store.formatPrice(cartData.cartItem.price)}</span>
        </div>
      </div>
      <div class="toast-actions">
        <button class="toast-btn toast-btn-secondary" onclick="this.closest('.toast-item').remove()">
          Continue shopping
        </button>
        <button class="toast-btn toast-btn-primary" onclick="UI.openCart(); this.closest('.toast-item').remove();">
          View bag
        </button>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
      }
    }, 6000);
  },

  /**
   * Cart Drawer
   */
  openCart() {
    const drawer = document.getElementById('cart-drawer-backdrop');
    if (drawer) {
      this.renderCartDrawer();
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCart() {
    const drawer = document.getElementById('cart-drawer-backdrop');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  renderCartDrawer() {
    const itemsList = document.getElementById('cart-items-list');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const headerCount = document.getElementById('cart-header-count');
    const navCount = document.getElementById('cart-nav-count');
    const shippingMsg = document.getElementById('cart-shipping-msg');
    const shippingFill = document.getElementById('cart-shipping-fill');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    const cart = window.store.cart;
    const count = window.store.getCartCount();
    const subtotal = window.store.getCartSubtotal();
    const remaining = window.store.getShippingRemaining();
    const reg = window.store.getRegion();

    if (navCount) navCount.textContent = count;
    if (headerCount) headerCount.textContent = `(${count})`;
    if (subtotalEl) subtotalEl.textContent = window.store.formatPrice(subtotal);

    // Free shipping threshold
    if (shippingMsg && shippingFill) {
      if (subtotal === 0) {
        shippingMsg.textContent = `Add ${reg.shippingThresholdText} for free shipping`;
        shippingFill.style.width = '0%';
      } else if (remaining === 0) {
        shippingMsg.textContent = 'You qualify for Free Shipping!';
        shippingFill.style.width = '100%';
      } else {
        shippingMsg.textContent = `Add ${window.store.formatPrice(remaining)} more for Free Shipping`;
        const pct = Math.min(100, (subtotal / reg.shippingThreshold) * 100);
        shippingFill.style.width = `${pct}%`;
      }
    }

    if (!itemsList) return;

    if (cart.length === 0) {
      itemsList.innerHTML = `
        <div class="cart-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-hairline)" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p style="font-family: var(--font-serif-title); font-size: 1.3rem; text-transform: uppercase;">Your bag is empty</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Saved items look better when you wear them.</p>
          <button class="btn-primary" onclick="UI.closeCart(); UI.setCategory('all');" style="margin-top: 1rem;">
            Shop Drop 01
          </button>
        </div>
      `;
      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
      }
      return;
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = '1';
    }

    itemsList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-top">
            <div>
              <h4 class="cart-item-name">${item.name}</h4>
              <p class="cart-item-size">Size: ${item.size} / ${item.color}</p>
            </div>
            <button class="cart-item-remove-btn" onclick="window.store.removeFromCart('${item.id}')" aria-label="Remove ${item.name}">
              Remove
            </button>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-qty-stepper">
              <button class="qty-btn" onclick="window.store.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" onclick="window.store.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-item-price">${window.store.formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Search Overlay
   */
  openSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
      }
      this.handleSearchInput('');
    }
  },

  closeSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  handleSearchInput(query) {
    window.store.searchQuery = query;
    const resultsContainer = document.getElementById('search-results-grid');
    if (!resultsContainer) return;

    const filtered = window.store.getFilteredProducts();
    resultsContainer.innerHTML = '';

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center;">
          <p style="font-family: var(--font-serif-title); font-size: 1.2rem; text-transform: uppercase;">No products found for "${query}"</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Try searching for "Blond", "YVL", "Graphic", or "300 GSM".</p>
        </div>
      `;
      return;
    }

    filtered.forEach((product, i) => {
      resultsContainer.appendChild(this.createProductCard(product, i));
    });
  },

  /**
   * Checkout Flow
   */
  openCheckout() {
    if (window.store.cart.length === 0) return;
    this.closeCart();

    const view = document.getElementById('checkout-view');
    if (view) {
      const chkCountry = document.getElementById('chk-country');
      if (chkCountry) {
        chkCountry.value = window.store.currentRegion;
      }
      this.renderCheckoutSummary();
      view.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCheckout() {
    const view = document.getElementById('checkout-view');
    if (view) {
      view.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  renderCheckoutSummary() {
    const itemsEl = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');

    const cart = window.store.cart;
    const subtotal = window.store.getCartSubtotal();
    const shipping = window.store.getShippingCost();
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = window.store.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : window.store.formatPrice(shipping);
    if (totalEl) totalEl.textContent = window.store.formatPrice(total);

    if (!itemsEl) return;

    itemsEl.innerHTML = cart.map(item => `
      <div style="display: grid; grid-template-columns: 60px 1fr auto; gap: 0.85rem; align-items: center; padding-bottom: 0.85rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 0.85rem;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 75px; object-fit: cover; border: 1px solid var(--border-hairline);">
        <div>
          <h5 style="font-size: 0.95rem; font-family: var(--font-serif-title); line-height: 1.1;">${item.name}</h5>
          <p style="font-size: 0.75rem; color: var(--text-secondary);">Size: ${item.size} • Qty: ${item.quantity}</p>
        </div>
        <span style="font-family: var(--font-serif-title); font-size: 1rem; font-weight: 700;">${window.store.formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
  },

  async processOrder(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('place-order-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'REDIRECTING TO STRIPE...';
    }

    const email = document.getElementById('chk-email')?.value?.trim();
    const phone = document.getElementById('chk-phone')?.value?.trim();
    const payload = {
      region: window.store.currentRegion,
      email,
      phone,
      shipping: {
        firstName: document.getElementById('chk-fname')?.value?.trim(),
        lastName: document.getElementById('chk-lname')?.value?.trim(),
        address: document.getElementById('chk-address')?.value?.trim(),
        suite: document.getElementById('chk-suite')?.value?.trim(),
        city: document.getElementById('chk-city')?.value?.trim(),
        postal: document.getElementById('chk-pin')?.value?.trim()
      },
      items: window.store.cart.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Checkout could not be started.');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Payment setup failed. If you are testing locally, use `npm run dev` (Vercel) so the checkout API is available.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue to secure payment';
      }
    }
  },

  showCheckoutSuccess(orderRef, email) {
    const formCol = document.getElementById('checkout-form-container');
    const view = document.getElementById('checkout-view');
    if (view) {
      view.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    if (formCol) {
      formCol.innerHTML = `
        <div class="confirmation-card">
          <div class="confirmation-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="eyebrow">ORDER CONFIRMED</span>
          <h2 style="font-size: 2.4rem; line-height: 1; font-family: var(--font-serif-title);">THANK YOU FOR YOUR ORDER</h2>
          <p style="font-size: 0.95rem; max-width: 480px;">
            Order reference <strong style="color: var(--accent-bronze);">${orderRef}</strong> is paid. Fulfillment starts from our studio in India within 24–48 business hours.
          </p>
          <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 1.25rem; width: 100%; text-align: left; font-size: 0.85rem; margin: 1rem 0;">
            <p style="margin-bottom: 0.4rem;"><strong>Receipt:</strong> Sent to ${email || 'your email on file with Stripe'}</p>
            <p><strong>Tracking:</strong> Emailed when your parcel ships</p>
          </div>
          <button class="btn-primary" onclick="UI.closeCheckout(); window.history.replaceState({}, '', window.location.pathname);">
            Return to Store
          </button>
        </div>
      `;
    }

    window.store.clearCart();
  },

  /**
   * Legal & Support Views
   */
  openPrivacyPolicy() {
    this.openModalWithContent('PRIVACY POLICY', `
      <div class="legal-article">
        <p><strong>Effective Date:</strong> October 2026</p>
        <p>TYCHE ("we", "our", or "us") respects your privacy. We collect only what is necessary to get your orders to you quickly and securely.</p>
        
        <h3>1. Data We Collect</h3>
        <p>We collect information you provide when placing an order or signing up for drop alerts: your name, shipping address, email, phone number, and payment details.</p>
        
        <h3>2. How We Use Your Data</h3>
        <p>Your details are used strictly to fulfill orders, provide shipment tracking via courier partners, prevent fraud, and send drop updates if you opt in.</p>
        
        <h3>3. Data Protection</h3>
        <p>We do not sell, rent, or trade your personal data. You can request deletion of your information anytime by contacting privacy@tycheclothing.com.</p>
      </div>
    `);
  },

  openTermsConditions() {
    this.openModalWithContent('TERMS & CONDITIONS', `
      <div class="legal-article">
        <p><strong>Last Updated:</strong> October 2026</p>
        
        <h3>1. General Terms</h3>
        <p>By browsing tycheclothing.com or placing an order, you agree to these terms. All items are produced in curated drops.</p>
        
        <h3>2. Drops & Inventory</h3>
        <p>Drop quantities are limited. In the rare instance an item is out of stock after order placement, we will issue an immediate notification and full refund.</p>
        
        <h3>3. Shipping</h3>
        <p>Door-to-door tracked shipping is provided for domestic India and international orders. Orders meeting the regional threshold qualify for complimentary shipping.</p>
        
        <h3>4. Returns & Exchanges</h3>
        <p>We accept returns of unworn, unwashed tees with original tags attached within 14 days of delivery.</p>
      </div>
    `);
  },

  openContact() {
    this.openModalWithContent('CONTACT & HELP', `
      <div class="legal-article">
        <p style="margin-bottom: 1.5rem;">Questions about sizing, orders, or upcoming drops? Reach out anytime.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 1.25rem;">
            <span class="eyebrow" style="font-size: 0.65rem;">GENERAL & ORDERS</span>
            <p style="color: var(--text-primary); font-weight: 600;">support@tycheclothing.com</p>
            <p style="font-size: 0.78rem; margin-top: 0.25rem;">Response time: within 12 hours</p>
          </div>
          <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 1.25rem;">
            <span class="eyebrow" style="font-size: 0.65rem;">STUDIO & DISPATCH</span>
            <p style="color: var(--text-primary); font-weight: 600;">Tyche Studio & Production</p>
            <p style="font-size: 0.78rem; margin-top: 0.25rem;">Crafted & Dispatched from India</p>
          </div>
        </div>

        <form onsubmit="event.preventDefault(); alert('Message received. We will get back to you shortly.'); UI.closeGenericModal();" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label class="form-label">Your Email</label>
            <input type="email" required class="form-input" placeholder="email@address.com">
          </div>
          <div>
            <label class="form-label">Order Number (Optional)</label>
            <input type="text" class="form-input" placeholder="TH-XXXXXX">
          </div>
          <div>
            <label class="form-label">Message</label>
            <textarea required class="form-input" style="height: 100px; padding: 0.75rem;" placeholder="What can we help you with?"></textarea>
          </div>
          <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Send Message</button>
        </form>
      </div>
    `);
  },

  openSizeGuide() {
    this.openModalWithContent('SIZE & FIT GUIDE', `
      <div class="legal-article">
        <p>Tyche tees are designed with a relaxed boxy cut and dropped shoulders. Go true to size for the intended streetwear drape, or size down if you prefer a standard fit.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-hairline); text-align: left;">
              <th style="padding: 0.6rem; color: var(--accent-bronze);">SIZE</th>
              <th style="padding: 0.6rem;">CHEST (INCHES)</th>
              <th style="padding: 0.6rem;">LENGTH (INCHES)</th>
              <th style="padding: 0.6rem;">SHOULDER (INCHES)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.6rem; font-weight: 700; color: var(--text-primary);">S</td>
              <td style="padding: 0.6rem;">44"</td>
              <td style="padding: 0.6rem;">26.5"</td>
              <td style="padding: 0.6rem;">22"</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.6rem; font-weight: 700; color: var(--text-primary);">M</td>
              <td style="padding: 0.6rem;">47"</td>
              <td style="padding: 0.6rem;">27.5"</td>
              <td style="padding: 0.6rem;">23"</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.6rem; font-weight: 700; color: var(--text-primary);">L</td>
              <td style="padding: 0.6rem;">50"</td>
              <td style="padding: 0.6rem;">28.5"</td>
              <td style="padding: 0.6rem;">24"</td>
            </tr>
            <tr>
              <td style="padding: 0.6rem; font-weight: 700; color: var(--text-primary);">XL</td>
              <td style="padding: 0.6rem;">53"</td>
              <td style="padding: 0.6rem;">29.5"</td>
              <td style="padding: 0.6rem;">25"</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 0.8rem; color: var(--text-muted);">*Heavyweight combed cotton jersey, pre-shrunk to retain shape and fit after washing.</p>
      </div>
    `);
  },

  openCustomDomainModal() {
    this.openModalWithContent('LAUNCH READINESS & DOMAIN SETUP', `
      <div class="legal-article">
        <p>To connect your custom domain (e.g. <strong>tycheclothing.com</strong> or <strong>tychebrand.com</strong>), follow the standard DNS configuration records below:</p>
        
        <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 1.25rem; margin: 1.5rem 0; font-family: monospace; font-size: 0.82rem;">
          <p style="color: var(--accent-bronze); margin-bottom: 0.5rem;">// DNS RECORD CONFIGURATION</p>
          <p>Type: <strong>A</strong> | Host: <strong>@</strong> | Value: <strong>76.76.21.21</strong> | TTL: 3600</p>
          <p>Type: <strong>CNAME</strong> | Host: <strong>www</strong> | Value: <strong>cname.tycheclothing.com</strong> | TTL: 3600</p>
        </div>

        <h3>Launch-Ready Checklist</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem;">
          <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-bronze);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Multi-currency pricing engine active (India, US, UK, EU, CA, AU, UAE, SG, CN)
          </li>
          <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-bronze);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Custom domain DNS routing configured
          </li>
          <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-bronze);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Custom vector SVG favicon configured
          </li>
          <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-bronze);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Privacy Policy & Terms active
          </li>
        </ul>
      </div>
    `);
  },

  openModalWithContent(title, htmlContent) {
    const modal = document.getElementById('generic-modal');
    const modalBody = document.getElementById('generic-modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="legal-modal-content">
        <button class="modal-close-btn" onclick="UI.closeGenericModal()" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <span class="eyebrow">TYCHE / INFO</span>
        <h2 style="font-size: 2.2rem; margin-bottom: 1.5rem; line-height: 1; font-family: var(--font-serif-title);">${title}</h2>
        ${htmlContent}
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeGenericModal() {
    const modal = document.getElementById('generic-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};

window.UI = UI;
