/* ==========================================================================
   TYCHE APP BOOTSTRAPPER & EVENT WIRING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial renders & region sync
  UI.syncRegionUI();
  UI.renderFeaturedCarousel();
  UI.renderCollectionGrid();
  UI.renderCartDrawer();
  UI.refreshAllPrices();

  // Explicit listeners for region selector and checkout country select
  const regionSelector = document.getElementById('region-selector');
  if (regionSelector) {
    regionSelector.addEventListener('change', (e) => {
      UI.setRegion(e.target.value);
    });
  }

  const chkCountry = document.getElementById('chk-country');
  if (chkCountry) {
    chkCountry.addEventListener('change', (e) => {
      UI.setRegion(e.target.value);
    });
  }

  // 2. Subscribe to store changes to keep all UI synced
  window.store.subscribe((store) => {
    const navCount = document.getElementById('cart-nav-count');
    const headerCount = document.getElementById('cart-header-count');
    const count = store.getCartCount();

    if (navCount) navCount.textContent = count;
    if (headerCount) headerCount.textContent = `(${count})`;

    // Sync region UI and update any displayed prices
    UI.syncRegionUI();
    UI.refreshAllPrices();

    // If drawer is open, re-render its content
    const drawer = document.getElementById('cart-drawer-backdrop');
    if (drawer && drawer.classList.contains('active')) {
      UI.renderCartDrawer();
    }
  });

  // 3. Search input live listener with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        UI.handleSearchInput(e.target.value);
      }, 150);
    });
  }

  // 4. Sort dropdown listener
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      window.store.activeSort = e.target.value;
      UI.renderCollectionGrid();
    });
  }

  // 5. Global Keyboard handling (ESC closes all modals/drawers)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      UI.closeProductModal();
      UI.closeCart();
      UI.closeSearch();
      UI.closeGenericModal();
      UI.closeCheckout();
    }
  });

  // 6. Newsletter subscription form handling
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newsletter-email');
      const email = input ? input.value : '';
      if (email) {
        alert(`You're on the list. We'll send drop alerts for ${email}.`);
        if (input) input.value = '';
      }
    });
  }

  // 7. Hash Routing (e.g. #product/th-tee-01)
  const handleHashRouting = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#product/')) {
      const productId = hash.replace('#product/', '');
      UI.openProductModal(productId);
    }
  };

  window.addEventListener('hashchange', handleHashRouting);
  handleHashRouting();

  // 8. Stripe return URL (?checkout=success&order=TH-…)
  const params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'success') {
    const orderRef = params.get('order') || 'TH-CONFIRMED';
    UI.showCheckoutSuccess(orderRef, '');
  } else if (params.get('checkout') === 'cancelled') {
    UI.openCart();
    window.history.replaceState({}, '', window.location.pathname);
  }

  // 9. Initialize scroll reveals
  if (window.motion) {
    window.motion.refresh();
  }
});
