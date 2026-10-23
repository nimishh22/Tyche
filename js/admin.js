/* ==========================================================================
   TYCHE MISSION CONTROL — ADMIN DASHBOARD CONTROLLER (SHOPIFY REPLICA)
   Real-time order management, live inventory matrix, analytics & catalog
   ========================================================================== */

// Initial Seed Orders (Pre-populated so the dashboard is immediately rich & operational)
const SEED_ORDERS = [
  {
    id: 'TH-1084',
    date: 'Today, 22:15',
    customer: {
      name: 'Aarav Mehta',
      email: 'aarav.mehta@gmail.com',
      phone: '+91 98201 44521',
      address: '14/B Bandra West, Mumbai 400050',
      country: 'IN',
      flag: '🇮🇳'
    },
    items: [
      { id: 'th-tee-02', name: 'YVL VAMP Tee', size: 'L', qty: 1, priceINR: 1299 }
    ],
    financialStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    trackingNumber: '',
    carrier: 'Shiprocket',
    totalINR: 1299,
    channel: 'Online Store'
  },
  {
    id: 'TH-1083',
    date: 'Today, 19:40',
    customer: {
      name: 'Jordan Hayes',
      email: 'jordan.h@nyu.edu',
      phone: '+1 212 555 0192',
      address: '72 Mercer St, Soho, New York, NY 10012',
      country: 'US',
      flag: '🇺🇸'
    },
    items: [
      { id: 'th-tee-01', name: 'Frank Ocean Blond Tee', size: 'XL', qty: 1, priceUSD: 36 },
      { id: 'th-tee-02', name: 'YVL VAMP Tee', size: 'L', qty: 1, priceUSD: 38 }
    ],
    financialStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    trackingNumber: '',
    carrier: 'DHL Express',
    totalUSD: 74,
    channel: 'Online Store'
  },
  {
    id: 'TH-1082',
    date: 'Yesterday, 16:20',
    customer: {
      name: 'Rohan Sharma',
      email: 'rohan.s@outlook.com',
      phone: '+91 98110 33819',
      address: 'Flat 402, DLF Phase 5, Gurugram 122009',
      country: 'IN',
      flag: '🇮🇳'
    },
    items: [
      { id: 'th-tee-01', name: 'Frank Ocean Blond Tee', size: 'M', qty: 2, priceINR: 2400 }
    ],
    financialStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    trackingNumber: 'DEL-928174102',
    carrier: 'Delhivery',
    totalINR: 2400,
    channel: 'Instagram / Shop'
  },
  {
    id: 'TH-1081',
    date: 'Oct 11, 2026',
    customer: {
      name: 'Liam Davies',
      email: 'liam.davies@gmail.co.uk',
      phone: '+44 7911 123456',
      address: '18 Shoreditch High St, London E1 6PG',
      country: 'UK',
      flag: '🇬🇧'
    },
    items: [
      { id: 'th-tee-03', name: 'Messi Tee', size: 'L', qty: 1, priceGBP: 27 }
    ],
    financialStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    trackingNumber: 'DHL-88192019',
    carrier: 'DHL Express',
    totalGBP: 27,
    channel: 'Online Store'
  },
  {
    id: 'TH-1080',
    date: 'Oct 10, 2026',
    customer: {
      name: 'Elena Rostova',
      email: 'elena.rostova@berlin.de',
      phone: '+49 30 1234567',
      address: 'Torstraße 140, 10119 Berlin',
      country: 'EU',
      flag: '🇪🇺'
    },
    items: [
      { id: 'th-tee-01', name: 'Frank Ocean Blond Tee', size: 'S', qty: 1, priceEUR: 33 }
    ],
    financialStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    trackingNumber: 'DHL-994821',
    carrier: 'DHL Express',
    totalEUR: 33,
    channel: 'Online Store'
  }
];

class TycheAdmin {
  constructor() {
    this.currentTab = 'home';
    this.orders = this.loadOrders();
    this.inventory = this.loadInventory();
    this.discounts = this.loadDiscounts();
    this.activeOrder = null;

    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupShortcuts();
    this.renderActiveTab();
    this.updateLiveVisitorCount();

    // Periodically simulate live visitor fluctuation (Shopify style)
    setInterval(() => this.updateLiveVisitorCount(), 8000);
  }

  // --------------------------------------------------------------------------
  // DATA PERSISTENCE & SYNC
  // --------------------------------------------------------------------------
  loadOrders() {
    try {
      const saved = localStorage.getItem('tyche_admin_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    this.saveOrders(SEED_ORDERS);
    return SEED_ORDERS;
  }

  saveOrders(orders) {
    this.orders = orders;
    try {
      localStorage.setItem('tyche_admin_orders', JSON.stringify(orders));
    } catch (e) {}
  }

  loadInventory() {
    try {
      const saved = localStorage.getItem('tyche_admin_inventory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default inventory counts per size for existing tees
    const initial = {
      'th-tee-01': { S: 18, M: 45, L: 50, XL: 12 },
      'th-tee-02': { S: 12, M: 35, L: 40, XL: 8 },
      'th-tee-03': { S: 25, M: 60, L: 55, XL: 20 }
    };
    this.saveInventory(initial);
    return initial;
  }

  saveInventory(inv) {
    this.inventory = inv;
    try {
      localStorage.setItem('tyche_admin_inventory', JSON.stringify(inv));
    } catch (e) {}
  }

  loadDiscounts() {
    return [
      { code: 'DROP01', type: 'percentage', val: 10, status: 'Active', uses: 24 },
      { code: 'FREESHIP', type: 'shipping', val: 100, status: 'Active', uses: 18 },
      { code: 'VIP20', type: 'percentage', val: 20, status: 'Active', uses: 7 }
    ];
  }

  // --------------------------------------------------------------------------
  // NAVIGATION & TABS
  // --------------------------------------------------------------------------
  setupNavigation() {
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-tab') === tabName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update active tab panel
    document.querySelectorAll('.tab-view').forEach(panel => {
      panel.classList.remove('active');
    });

    const target = document.getElementById(`view-${tabName}`);
    if (target) {
      target.classList.add('active');
    }

    this.renderActiveTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderActiveTab() {
    if (this.currentTab === 'home') this.renderHomeView();
    if (this.currentTab === 'analytics') this.renderAnalyticsView();
    if (this.currentTab === 'orders') this.renderOrdersView();
    if (this.currentTab === 'products') this.renderProductsView();
    if (this.currentTab === 'inventory') this.renderInventoryView();
    if (this.currentTab === 'customers') this.renderCustomersView();
    if (this.currentTab === 'discounts') this.renderDiscountsView();
    if (this.currentTab === 'marketing') this.renderMarketingView();
    if (this.currentTab === 'online-store') this.renderOnlineStoreView();
    if (this.currentTab === 'social') this.renderSocialView();
    if (this.currentTab === 'settings') this.renderSettingsView();

    this.updateBadges();
  }

  updateBadges() {
    const unfulfilled = this.orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length;
    const orderBadge = document.getElementById('sidebar-orders-badge');
    if (orderBadge) {
      orderBadge.textContent = unfulfilled;
      if (unfulfilled > 0) orderBadge.classList.add('alert');
      else orderBadge.classList.remove('alert');
    }
  }

  updateLiveVisitorCount() {
    const el = document.getElementById('live-visitor-count');
    if (el) {
      // Realistic live visitor fluctuation
      const count = Math.floor(58 + Math.random() * 18);
      el.textContent = `${count} visitors`;
    }
  }

  setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandSearch();
      }
      if (e.key === 'Escape') {
        this.closeAllDrawers();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 1. HOME VIEW (IMAGE 2 REPLICA)
  // --------------------------------------------------------------------------
  renderHomeView() {
    const container = document.getElementById('view-home');
    if (!container) return;

    const unfulfilledCount = this.orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Overview</h1>
          <p class="page-subtitle">Welcome back. Real-time metrics for Tyche Drop 01.</p>
        </div>
        <div class="header-action-group">
          <div class="date-range-picker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <select id="home-date-select">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <a href="index.html" target="_blank" class="btn-admin-secondary">
            <span>View Storefront</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>

      <!-- Top 4 KPI Metrics (Exact Image 2) -->
      <div class="metrics-quad-grid">
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Total sales</span>
            <span class="metric-trend up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              18.74%
            </span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">₹84,290</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([12, 19, 15, 28, 24, 38, 42, 55], '#10b981')}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Total orders</span>
            <span class="metric-trend up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              18.74%
            </span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">${this.orders.length + 35}</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([4, 6, 8, 12, 9, 14, 18, 22], '#c2aa73')}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Conversion rate</span>
            <span class="metric-trend up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              18.74%
            </span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">3.74%</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([2.1, 2.5, 3.0, 2.8, 3.4, 3.2, 3.7], '#3b82f6')}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Visitors</span>
            <span class="metric-trend up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              18.74%
            </span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">1,248</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([80, 110, 95, 140, 180, 210, 260], '#c2aa73')}
          </div>
        </div>
      </div>

      <!-- Interactive Hourly Sales Chart (Image 2) -->
      <div class="analytics-card" style="margin-bottom: 2rem;">
        <div class="analytics-card-header">
          <div>
            <h3 class="analytics-card-title">Hourly Sales Performance</h3>
            <span class="analytics-card-amount">₹84,290.00</span>
          </div>
          <button class="btn-admin-secondary" onclick="admin.switchTab('analytics')">View Full Report</button>
        </div>
        <div class="chart-container">
          ${this.renderSalesOverTimeSVG()}
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-line"></div>
            <span>Today</span>
          </div>
          <div class="legend-item">
            <div class="legend-line dashed"></div>
            <span>Yesterday</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
        <div class="analytics-card" style="cursor: pointer;" onclick="admin.switchTab('orders')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="badge-pill unfulfilled">${unfulfilledCount} TO FULFILL</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <h4 style="font-size: 1.05rem; font-family: var(--admin-font-serif);">Orders Ready to Dispatch</h4>
          <p style="font-size: 0.8rem; color: var(--admin-text-muted); margin-top: 0.35rem;">Print shipping labels & dispatch via Shiprocket / DHL.</p>
        </div>

        <div class="analytics-card" style="cursor: pointer;" onclick="admin.switchTab('products')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="badge-pill active">IN STOCK</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <h4 style="font-size: 1.05rem; font-family: var(--admin-font-serif);">Inventory & Sizes</h4>
          <p style="font-size: 0.8rem; color: var(--admin-text-muted); margin-top: 0.35rem;">Manage quantities per size. 3 Tees live on Drop 01.</p>
        </div>

        <div class="analytics-card" style="cursor: pointer;" onclick="admin.openAddProductModal()">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="badge-pill" style="background: rgba(194, 170, 115, 0.15); color: var(--admin-accent-gold);">+ NEW</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <h4 style="font-size: 1.05rem; font-family: var(--admin-font-serif);">Add New Graphic Tee</h4>
          <p style="font-size: 0.8rem; color: var(--admin-text-muted); margin-top: 0.35rem;">Upload upcoming graphics & set India/US pricing.</p>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. ANALYTICS VIEW (EXACT IMAGE 1 REPLICA)
  // --------------------------------------------------------------------------
  renderAnalyticsView() {
    const container = document.getElementById('view-analytics');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Analytics Overview</h1>
          <p class="page-subtitle">Track multi-currency revenue, conversion funnel, and channel performance.</p>
        </div>
        <div class="header-action-group">
          <div class="date-range-picker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <select>
              <option>Last 365 days</option>
              <option>Last 90 days</option>
              <option>Last 30 days</option>
              <option>Year to date</option>
            </select>
          </div>
          <span class="date-compare-text">Compare to: Previous period</span>
        </div>
      </div>

      <!-- Top 4 Image 1 Metric Cards -->
      <div class="metrics-quad-grid">
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Gross sales</span>
            <span class="metric-trend up">↑ 28%</span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">₹1,12,490</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([10, 15, 20, 25, 30, 45, 55], '#3b82f6')}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Returning customer rate</span>
            <span class="metric-trend up">↑ 45%</span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">43.36%</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([20, 25, 28, 35, 40, 43], '#3b82f6')}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Orders fulfilled</span>
            <span class="metric-trend up">↑ 31%</span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">160</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([15, 20, 30, 45, 60, 75], '#3b82f6')}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Orders</span>
            <span class="metric-trend up">↑ 33%</span>
          </div>
          <div class="metric-number-row">
            <span class="metric-val">162</span>
          </div>
          <div class="metric-sparkline">
            ${this.renderSVGSparkline([16, 22, 32, 48, 62, 80], '#3b82f6')}
          </div>
        </div>
      </div>

      <!-- Image 1 Row 1: Total Sales Over Time + Total Sales Breakdown -->
      <div class="analytics-grid-layout">
        <!-- Card 1: Total Sales Over Time -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <h3 class="analytics-card-title">Total sales over time</h3>
              <div class="analytics-card-amount">₹84,290.00 <span style="font-size: 0.85rem; color: var(--admin-green);">↑ 31%</span></div>
            </div>
          </div>
          <div class="chart-container">
            ${this.renderTotalSalesTimeSVG()}
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-line" style="background: #3b82f6;"></div>
              <span>Current Year</span>
            </div>
            <div class="legend-item">
              <div class="legend-line dashed"></div>
              <span>Previous Year</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Total Sales Breakdown -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <h3 class="analytics-card-title">Total sales breakdown</h3>
          </div>
          <table class="breakdown-table">
            <tbody>
              <tr>
                <td>Gross sales</td>
                <td>₹1,12,490.00 <span style="font-size: 0.7rem; color: var(--admin-green);">↑28%</span></td>
              </tr>
              <tr>
                <td>Discounts</td>
                <td style="color: var(--admin-red);">-₹18,200.00 <span style="font-size: 0.7rem; color: var(--admin-text-muted);">↑4%</span></td>
              </tr>
              <tr>
                <td>Returns</td>
                <td style="color: var(--admin-red);">-₹8,400.00 <span style="font-size: 0.7rem; color: var(--admin-text-muted);">↑39%</span></td>
              </tr>
              <tr>
                <td>Net sales</td>
                <td>₹85,890.00 <span style="font-size: 0.7rem; color: var(--admin-green);">↑31%</span></td>
              </tr>
              <tr>
                <td>Shipping charges</td>
                <td>₹990.00 <span style="font-size: 0.7rem; color: var(--admin-green);">↑58%</span></td>
              </tr>
              <tr>
                <td>Return fees</td>
                <td>₹0.00</td>
              </tr>
              <tr>
                <td>Taxes</td>
                <td>₹1,410.00</td>
              </tr>
              <tr class="total-row">
                <td>Total sales</td>
                <td>₹84,290.00 <span style="font-size: 0.75rem; color: var(--admin-green);">↑31%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Image 1 Row 2: Sales Channel Donut, AOV Over Time, Product Sales -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Card 3: Total Sales by Channel / Region -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <h3 class="analytics-card-title">Sales by Region & Channel</h3>
          </div>
          <div class="donut-wrap">
            <svg class="donut-svg" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--admin-border)" stroke-width="5"></circle>
              <!-- India (65%) -->
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#a3894f" stroke-width="5" stroke-dasharray="65 35" stroke-dashoffset="25"></circle>
              <!-- US & International (35%) -->
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="5" stroke-dasharray="35 65" stroke-dashoffset="60"></circle>
            </svg>
            <div class="donut-legend">
              <div><span style="color: #a3894f; font-weight: 700;">🇮🇳 India (65%)</span><br><small style="color: var(--admin-text-muted);">₹54,788</small></div>
              <div><span style="color: #3b82f6; font-weight: 700;">🌐 US & Intl (35%)</span><br><small style="color: var(--admin-text-muted);">$354 (~₹29,502)</small></div>
            </div>
          </div>
        </div>

        <!-- Card 4: Average Order Value -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <h3 class="analytics-card-title">Average order value</h3>
              <div class="analytics-card-amount">₹1,348.00 <span style="font-size: 0.85rem; color: var(--admin-green);">↑ 1.7%</span></div>
            </div>
          </div>
          <div class="chart-container">
            ${this.renderAOVChartSVG()}
          </div>
        </div>

        <!-- Card 5: Total Sales by Product -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <h3 class="analytics-card-title">Total sales by product</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                <span style="font-weight: 600;">YVL VAMP Tee</span>
                <span style="font-family: var(--admin-font-mono);">₹42,867 (51%)</span>
              </div>
              <div style="background: var(--admin-border-subtle); height: 16px; border-radius: 2px;">
                <div style="background: #a3894f; width: 51%; height: 100%; border-radius: 2px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                <span style="font-weight: 600;">Frank Ocean Blond Tee</span>
                <span style="font-family: var(--admin-font-mono);">₹32,400 (38%)</span>
              </div>
              <div style="background: var(--admin-border-subtle); height: 16px; border-radius: 2px;">
                <div style="background: #3b82f6; width: 38%; height: 100%; border-radius: 2px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                <span style="font-weight: 600;">Messi Tee</span>
                <span style="font-family: var(--admin-font-mono);">₹9,023 (11%)</span>
              </div>
              <div style="background: var(--admin-border-subtle); height: 16px; border-radius: 2px;">
                <div style="background: #6e6758; width: 11%; height: 100%; border-radius: 2px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image 1 Row 3: Sessions Over Time, Conversion Rate Over Time, Funnel Breakdown -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
        <!-- Card 6: Sessions Over Time -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <h3 class="analytics-card-title">Sessions over time</h3>
              <div class="analytics-card-amount">10,216 <span style="font-size: 0.85rem; color: var(--admin-green);">↑ 22%</span></div>
            </div>
          </div>
          <div class="chart-container">
            ${this.renderSessionsChartSVG()}
          </div>
        </div>

        <!-- Card 7: Conversion Rate Over Time -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <h3 class="analytics-card-title">Conversion rate over time</h3>
              <div class="analytics-card-amount">1.36% <span style="font-size: 0.85rem; color: var(--admin-green);">↑ 14%</span></div>
            </div>
          </div>
          <div class="chart-container">
            ${this.renderConversionRateChartSVG()}
          </div>
        </div>

        <!-- Card 8: Conversion Rate Funnel Breakdown (Image 1 bottom-right) -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <h3 class="analytics-card-title">Conversion rate breakdown</h3>
              <div class="analytics-card-amount">1.36% <span style="font-size: 0.85rem; color: var(--admin-green);">↑ 14%</span></div>
            </div>
          </div>
          <div class="funnel-container">
            <div class="funnel-stage">
              <div class="funnel-stage-header">
                <span>Sessions</span>
                <span>100% (10,216)</span>
              </div>
              <div class="funnel-bar-bg"><div class="funnel-bar-fill" style="width: 100%;"></div></div>
            </div>
            <div class="funnel-stage">
              <div class="funnel-stage-header">
                <span>Added to cart</span>
                <span>7.39% (755)</span>
              </div>
              <div class="funnel-bar-bg"><div class="funnel-bar-fill" style="width: 7.39%;"></div></div>
            </div>
            <div class="funnel-stage">
              <div class="funnel-stage-header">
                <span>Reached checkout</span>
                <span>9.38% (958)</span>
              </div>
              <div class="funnel-bar-bg"><div class="funnel-bar-fill" style="width: 9.38%;"></div></div>
            </div>
            <div class="funnel-stage">
              <div class="funnel-stage-header">
                <span>Converted</span>
                <span>1.36% (139)</span>
              </div>
              <div class="funnel-bar-bg"><div class="funnel-bar-fill accent" style="width: 1.36%;"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 3. ORDERS VIEW (SHOPIFY POLARIS TABLE)
  // --------------------------------------------------------------------------
  renderOrdersView(filter = 'all') {
    const container = document.getElementById('view-orders');
    if (!container) return;

    let filtered = [...this.orders];
    if (filter === 'unfulfilled') filtered = filtered.filter(o => o.fulfillmentStatus === 'unfulfilled');
    if (filter === 'fulfilled') filtered = filtered.filter(o => o.fulfillmentStatus === 'fulfilled');
    if (filter === 'paid') filtered = filtered.filter(o => o.financialStatus === 'paid');

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Orders</h1>
          <p class="page-subtitle">Track, fulfill, and print courier packing slips for international & domestic buyers.</p>
        </div>
        <div class="header-action-group">
          <button class="btn-admin-secondary" onclick="admin.exportOrdersCSV()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div class="data-card">
        <div class="table-filter-bar">
          <div class="filter-tabs-row">
            <button class="table-tab-btn ${filter === 'all' ? 'active' : ''}" onclick="admin.renderOrdersView('all')">All</button>
            <button class="table-tab-btn ${filter === 'unfulfilled' ? 'active' : ''}" onclick="admin.renderOrdersView('unfulfilled')">Unfulfilled</button>
            <button class="table-tab-btn ${filter === 'fulfilled' ? 'active' : ''}" onclick="admin.renderOrdersView('fulfilled')">Fulfilled</button>
            <button class="table-tab-btn ${filter === 'paid' ? 'active' : ''}" onclick="admin.renderOrdersView('paid')">Paid</button>
          </div>
          <div class="table-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Filter orders..." oninput="admin.filterOrdersBySearch(this.value)">
          </div>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox"></th>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Items</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody id="orders-table-body">
            ${filtered.map(order => `
              <tr onclick="admin.openOrderDetail('${order.id}')">
                <td onclick="event.stopPropagation()"><input type="checkbox"></td>
                <td style="font-family: var(--admin-font-mono); font-weight: 700; color: var(--admin-accent-gold);">${order.id}</td>
                <td>${order.date}</td>
                <td style="color: var(--admin-text-main); font-weight: 500;">
                  ${order.customer.flag} ${order.customer.name}
                </td>
                <td><span class="badge-pill ${order.financialStatus}">${order.financialStatus}</span></td>
                <td><span class="badge-pill ${order.fulfillmentStatus}">${order.fulfillmentStatus}</span></td>
                <td>${order.items.map(i => `${i.name} (${i.size})`).join(', ')}</td>
                <td style="text-align: right; font-family: var(--admin-font-mono); font-weight: 600; color: var(--admin-text-main);">
                  ${this.formatOrderTotal(order)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  formatOrderTotal(order) {
    if (order.totalINR) return `₹${order.totalINR.toLocaleString('en-IN')}`;
    if (order.totalUSD) return `$${order.totalUSD}.00`;
    if (order.totalGBP) return `£${order.totalGBP}.00`;
    if (order.totalEUR) return `€${order.totalEUR}.00`;
    return '₹1,200';
  }

  // --------------------------------------------------------------------------
  // 4. PRODUCTS & INVENTORY VIEW
  // --------------------------------------------------------------------------
  renderProductsView() {
    const container = document.getElementById('view-products');
    if (!container) return;

    const catalog = window.PRODUCTS || [];

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Products & Inventory</h1>
          <p class="page-subtitle">Manage garment specifications, sizes, live stock matrix, and pricing.</p>
        </div>
        <div class="header-action-group">
          <button class="btn-admin-primary" onclick="admin.openAddProductModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Product
          </button>
        </div>
      </div>

      <div class="data-card">
        <div class="table-filter-bar">
          <span style="font-size: 0.82rem; font-weight: 600;">ACTIVE CATALOG (DROP 01)</span>
          <span style="font-size: 0.75rem; color: var(--admin-text-dim);">Live stock updates sync instantly to the storefront</span>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 60px;">Photo</th>
              <th>Product</th>
              <th>Status</th>
              <th>Inventory by Size (S / M / L / XL)</th>
              <th>Base Price (INR)</th>
              <th>US Anchor</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${catalog.map(product => {
              const inv = this.inventory[product.id] || { S: 10, M: 20, L: 20, XL: 5 };
              const totalStock = Object.values(inv).reduce((a, b) => a + b, 0);

              return `
                <tr>
                  <td>
                    <img class="table-prod-img" src="${product.images.primary}" alt="${product.name}">
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--admin-text-main);">${product.name}</div>
                    <div style="font-size: 0.72rem; color: var(--admin-text-dim);">${product.specs?.weight || '300 GSM'} • ${product.color}</div>
                  </td>
                  <td>
                    <span class="badge-pill ${totalStock > 0 ? 'active' : 'low-stock'}">
                      ${totalStock > 0 ? `${totalStock} In Stock` : 'Sold Out'}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.5rem; align-items: center;" onclick="event.stopPropagation()">
                      ${['S', 'M', 'L', 'XL'].map(sz => `
                        <div style="display: flex; flex-direction: column; align-items: center; background: var(--admin-bg-sidebar); border: 1px solid var(--admin-border); padding: 0.25rem 0.5rem; border-radius: 4px;">
                          <span style="font-size: 0.65rem; color: var(--admin-accent-gold); font-weight: 700;">${sz}</span>
                          <input type="number" min="0" value="${inv[sz] || 0}" 
                            style="width: 38px; background: transparent; border: none; color: var(--admin-text-main); font-family: var(--admin-font-mono); font-size: 0.8rem; text-align: center; outline: none;"
                            onchange="admin.updateSizeStock('${product.id}', '${sz}', this.value)">
                        </div>
                      `).join('')}
                    </div>
                  </td>
                  <td style="font-family: var(--admin-font-mono); font-weight: 600; color: var(--admin-text-main);">
                    ₹${(product.priceINR || product.price || 1200).toLocaleString('en-IN')}
                  </td>
                  <td style="font-family: var(--admin-font-mono); color: var(--admin-text-muted);">
                    $${product.priceUSD || 36}.00
                  </td>
                  <td style="text-align: right;" onclick="event.stopPropagation()">
                    <a href="index.html#product/${product.id}" target="_blank" class="btn-admin-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
                      Preview ↗
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  updateSizeStock(productId, size, count) {
    if (!this.inventory[productId]) this.inventory[productId] = { S: 0, M: 0, L: 0, XL: 0 };
    this.inventory[productId][size] = parseInt(count) || 0;
    this.saveInventory(this.inventory);

    // Provide quick visual toast
    this.showToast(`Updated ${productId} Size ${size} inventory to ${count}`);
  }

  // --------------------------------------------------------------------------
  // 5. CUSTOMERS VIEW
  // --------------------------------------------------------------------------
  renderCustomersView() {
    const container = document.getElementById('view-customers');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Customers</h1>
          <p class="page-subtitle">Buyer directory, orders history, and geographic distribution.</p>
        </div>
      </div>

      <div class="data-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Total Spend</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            ${this.orders.map(o => `
              <tr>
                <td style="font-weight: 600; color: var(--admin-text-main);">${o.customer.name}</td>
                <td>${o.customer.flag} ${o.customer.country}</td>
                <td style="font-family: var(--admin-font-mono);">1 order</td>
                <td style="font-family: var(--admin-font-mono); font-weight: 700; color: var(--admin-accent-gold);">${this.formatOrderTotal(o)}</td>
                <td>${o.customer.email}</td>
                <td>${o.customer.phone}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6. DISCOUNTS VIEW
  // --------------------------------------------------------------------------
  renderDiscountsView() {
    const container = document.getElementById('view-discounts');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Discounts & Drop Promos</h1>
          <p class="page-subtitle">Manage coupon codes active during drops and launch campaigns.</p>
        </div>
        <button class="btn-admin-primary" onclick="admin.openCreateDiscountModal()">Create Discount Code</button>
      </div>

      <div class="data-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Type</th>
              <th>Value</th>
              <th>Redemptions</th>
            </tr>
          </thead>
          <tbody>
            ${this.discounts.map(d => `
              <tr>
                <td style="font-family: var(--admin-font-mono); font-weight: 700; color: var(--admin-accent-gold); font-size: 0.95rem;">${d.code}</td>
                <td><span class="badge-pill active">${d.status}</span></td>
                <td style="text-transform: capitalize;">${d.type}</td>
                <td style="font-family: var(--admin-font-mono);">${d.type === 'percentage' ? `${d.val}% OFF` : 'Free Shipping'}</td>
                <td style="font-family: var(--admin-font-mono);">${d.uses} used</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 7. SETTINGS VIEW
  // --------------------------------------------------------------------------
  renderSettingsView() {
    const container = document.getElementById('view-settings');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Store Settings</h1>
          <p class="page-subtitle">Global currencies, exchange rates, shipping thresholds, and compliance.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="analytics-card">
          <h3 class="analytics-card-title" style="margin-bottom: 1rem;">Multi-Currency & Exchange Rates</h3>
          <p style="font-size: 0.8rem; color: var(--admin-text-muted); margin-bottom: 1rem;">
            Automatic daily rate refresh from <code>https://open.er-api.com/v6/latest/USD</code>. Strictly stronger-than-INR currencies only.
          </p>
          <div style="background: var(--admin-bg-sidebar); border: 1px solid var(--admin-border); padding: 1rem; border-radius: var(--admin-radius-sm); font-size: 0.78rem; font-family: var(--admin-font-mono); line-height: 1.8;">
            <div>🇮🇳 India (INR): Base ₹1,200</div>
            <div>🇺🇸 United States (USD): Base $36.00</div>
            <div>🇬🇧 United Kingdom (GBP): Live auto-conversion</div>
            <div>🇪🇺 Europe (EUR): Live auto-conversion</div>
            <div>🇨🇦 Canada (CAD): Live auto-conversion</div>
            <div>🇦🇺 Australia (AUD): Live auto-conversion</div>
            <div>🇦🇪 UAE (AED): Live auto-conversion</div>
            <div>🇸🇬 Singapore (SGD): Live auto-conversion</div>
            <div>🇨🇳 China (CNY): Live auto-conversion</div>
          </div>
          <button class="btn-admin-secondary" style="margin-top: 1rem;" onclick="admin.refreshDailyRatesManual()">
            Sync Daily Rates Now
          </button>
        </div>

        <div class="analytics-card">
          <h3 class="analytics-card-title" style="margin-bottom: 1rem;">Free Shipping Thresholds</h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.82rem;">
            <div>
              <label class="form-field-label">India Domestic Free Shipping</label>
              <input type="text" class="form-field-input" value="₹2,500" readonly>
            </div>
            <div>
              <label class="form-field-label">USA International Free Shipping</label>
              <input type="text" class="form-field-input" value="$100.00" readonly>
            </div>
            <div>
              <label class="form-field-label">Fulfillment Facility</label>
              <input type="text" class="form-field-input" value="Tyche Studio, Mumbai, India" readonly>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // ORDER DETAIL SLIDE-OVER DRAWER
  // --------------------------------------------------------------------------
  openOrderDetail(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    this.activeOrder = order;

    const drawer = document.getElementById('order-detail-drawer');
    const content = document.getElementById('order-drawer-content');
    if (!drawer || !content) return;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.72rem; color: var(--admin-text-dim); text-transform: uppercase;">Placed ${order.date}</span>
          <h2 style="font-family: var(--admin-font-serif); font-size: 1.6rem; color: var(--admin-text-main);">${order.id}</h2>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <span class="badge-pill ${order.financialStatus}">${order.financialStatus}</span>
          <span class="badge-pill ${order.fulfillmentStatus}">${order.fulfillmentStatus}</span>
        </div>
      </div>

      <!-- Customer & Shipping Address -->
      <div style="background: var(--admin-bg-card); border: 1px solid var(--admin-border); padding: 1.25rem; border-radius: var(--admin-radius-sm);">
        <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--admin-accent-gold); margin-bottom: 0.5rem; text-transform: uppercase;">Shipping Destination</h4>
        <p style="font-weight: 600; color: var(--admin-text-main);">${order.customer.name}</p>
        <p style="font-size: 0.82rem; color: var(--admin-text-muted);">${order.customer.address}</p>
        <p style="font-size: 0.82rem; color: var(--admin-text-muted);">${order.customer.flag} ${order.customer.country}</p>
        <p style="font-size: 0.82rem; margin-top: 0.5rem; font-family: var(--admin-font-mono); color: var(--admin-accent-gold);">${order.customer.phone} • ${order.customer.email}</p>
      </div>

      <!-- Items Ordered -->
      <div>
        <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text-muted); margin-bottom: 0.75rem; text-transform: uppercase;">Line Items</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--admin-bg-card); border: 1px solid var(--admin-border); padding: 0.85rem; border-radius: var(--admin-radius-sm);">
              <div>
                <div style="font-weight: 600; font-size: 0.88rem; color: var(--admin-text-main);">${item.name}</div>
                <div style="font-size: 0.75rem; color: var(--admin-text-dim);">Size: ${item.size} • Qty: ${item.qty}</div>
              </div>
              <div style="font-family: var(--admin-font-mono); font-weight: 600;">
                ${this.formatOrderTotal(order)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Courier Fulfillment Section -->
      <div style="background: var(--admin-bg-card); border: 1px solid var(--admin-border); padding: 1.25rem; border-radius: var(--admin-radius-sm);">
        <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--admin-accent-gold); margin-bottom: 0.75rem; text-transform: uppercase;">Fulfillment Details</h4>
        <div class="form-field-group" style="margin-bottom: 0.75rem;">
          <label class="form-field-label">Shipping Carrier</label>
          <select id="carrier-input" class="form-field-input">
            <option value="Shiprocket" ${order.carrier === 'Shiprocket' ? 'selected' : ''}>Shiprocket (Domestic India)</option>
            <option value="Delhivery" ${order.carrier === 'Delhivery' ? 'selected' : ''}>Delhivery (Express Surface)</option>
            <option value="DHL Express" ${order.carrier === 'DHL Express' ? 'selected' : ''}>DHL Express (International US/UK/EU)</option>
            <option value="India Post EMS" ${order.carrier === 'India Post EMS' ? 'selected' : ''}>India Post EMS</option>
          </select>
        </div>
        <div class="form-field-group">
          <label class="form-field-label">Tracking Air Waybill (AWB) #</label>
          <input type="text" id="tracking-input" class="form-field-input" placeholder="e.g. DEL-9821721" value="${order.trackingNumber || ''}">
        </div>

        <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
          <button class="btn-admin-primary" onclick="admin.markOrderFulfilled('${order.id}')" style="flex: 1; justify-content: center;">
            ${order.fulfillmentStatus === 'fulfilled' ? 'Update Tracking' : 'Mark as Fulfilled'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('order-detail-backdrop')?.classList.add('active');
  }

  markOrderFulfilled(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const carrier = document.getElementById('carrier-input')?.value || 'Shiprocket';
    const tracking = document.getElementById('tracking-input')?.value || 'TRACK-' + Math.floor(100000 + Math.random() * 900000);

    order.fulfillmentStatus = 'fulfilled';
    order.carrier = carrier;
    order.trackingNumber = tracking;

    this.saveOrders(this.orders);
    this.closeAllDrawers();
    this.renderOrdersView();
    this.showToast(`Order ${orderId} marked as fulfilled with ${carrier} tracking: ${tracking}`);
  }

  // --------------------------------------------------------------------------
  // ADD NEW PRODUCT MODAL
  // --------------------------------------------------------------------------
  openAddProductModal() {
    const backdrop = document.getElementById('product-modal-backdrop');
    if (backdrop) backdrop.classList.add('active');
  }

  saveNewProduct(e) {
    e.preventDefault();

    const title = document.getElementById('new-prod-title').value;
    const priceINR = parseInt(document.getElementById('new-prod-price-inr').value) || 1200;
    const priceUSD = parseInt(document.getElementById('new-prod-price-usd').value) || 36;
    const weight = document.getElementById('new-prod-weight').value || '300 GSM Heavy Single Jersey';
    const desc = document.getElementById('new-prod-desc').value || 'Graphic tee crafted in India.';
    const imgUrl = document.getElementById('new-prod-img').value || 'assets/images/prod_messi_model_front.jpg';
    const color = document.getElementById('new-prod-color').value || 'Vintage Black';

    const stockS = parseInt(document.getElementById('new-prod-s').value) || 15;
    const stockM = parseInt(document.getElementById('new-prod-m').value) || 30;
    const stockL = parseInt(document.getElementById('new-prod-l').value) || 30;
    const stockXL = parseInt(document.getElementById('new-prod-xl').value) || 10;

    const newId = 'th-tee-' + String((window.PRODUCTS || []).length + 1).padStart(2, '0');

    const newProduct = {
      id: newId,
      name: title,
      category: 't-shirts',
      categoryLabel: 'Graphic Tee',
      priceINR: priceINR,
      priceUSD: priceUSD,
      color: color,
      badge: 'NEW DROP',
      badgeType: 'tag-new',
      isFeatured: true,
      isFavourite: true,
      images: {
        primary: imgUrl,
        secondary: imgUrl,
        gallery: [imgUrl]
      },
      description: desc,
      specs: {
        weight: weight,
        fit: 'Relaxed Boxy / Dropped Shoulders',
        wash: color,
        origin: 'Crafted in India'
      },
      sizes: ['S', 'M', 'L', 'XL']
    };

    if (!window.PRODUCTS) window.PRODUCTS = [];
    window.PRODUCTS.push(newProduct);

    // Save custom products to localStorage so index.html also picks it up
    try {
      const custom = JSON.parse(localStorage.getItem('tyche_custom_products') || '[]');
      custom.push(newProduct);
      localStorage.setItem('tyche_custom_products', JSON.stringify(custom));
    } catch (err) {}

    // Save inventory
    this.inventory[newId] = { S: stockS, M: stockM, L: stockL, XL: stockXL };
    this.saveInventory(this.inventory);

    this.closeAllDrawers();
    this.renderProductsView();
    this.showToast(`Product "${title}" added to catalog and live inventory!`);
  }

  // --------------------------------------------------------------------------
  // COMMAND SEARCH (⌘K PALETTE)
  // --------------------------------------------------------------------------
  openCommandSearch() {
    const input = document.getElementById('global-search-input');
    if (input) {
      input.focus();
      input.select();
    }
  }

  handleGlobalSearch(query) {
    if (!query.trim()) return;
    const q = query.toLowerCase();

    // Check if matches order
    const matchOrder = this.orders.find(o => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q));
    if (matchOrder) {
      this.switchTab('orders');
      this.openOrderDetail(matchOrder.id);
      return;
    }

    // Check if matches product
    const matchProd = (window.PRODUCTS || []).find(p => p.name.toLowerCase().includes(q));
    if (matchProd) {
      this.switchTab('products');
      return;
    }
  }

  closeAllDrawers() {
    document.querySelectorAll('.admin-drawer-backdrop').forEach(d => d.classList.remove('active'));
  }

  refreshDailyRatesManual() {
    this.showToast('Connecting to open exchange rate API...');
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        this.showToast(`Rates synchronized. USD to INR: ₹${data.rates?.INR?.toFixed(2) || 83}`);
      })
      .catch(() => {
        this.showToast('Rates verified with baseline fallback.');
      });
  }

  exportOrdersCSV() {
    let csv = 'Order ID,Date,Customer,Country,Status,Fulfillment,Carrier,Tracking,Total\n';
    this.orders.forEach(o => {
      csv += `${o.id},"${o.date}","${o.customer.name}","${o.customer.country}","${o.financialStatus}","${o.fulfillmentStatus}","${o.carrier}","${o.trackingNumber}","${this.formatOrderTotal(o)}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tyche-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    this.showToast('Exported orders CSV successfully');
  }

  showToast(msg) {
    const container = document.getElementById('admin-toast');
    if (!container) return;
    container.textContent = msg;
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    setTimeout(() => {
      container.style.opacity = '0';
      container.style.transform = 'translateY(12px)';
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // SVG CHART GENERATORS (BEZIER POLARIS-STYLE CURVES)
  // --------------------------------------------------------------------------
  renderSVGSparkline(data, strokeColor) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 120;
    const h = 28;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    return `
      <svg class="sparkline-svg" viewBox="0 0 ${w} ${h}">
        <polyline fill="none" stroke="${strokeColor}" stroke-width="2" points="${pts}" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  renderSalesOverTimeSVG() {
    return `
      <svg class="chart-svg" viewBox="0 0 700 180">
        <defs>
          <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Horizontal gridlines -->
        <line x1="40" y1="30" x2="680" y2="30" stroke="var(--admin-border-subtle)" stroke-dasharray="3 3"/>
        <line x1="40" y1="80" x2="680" y2="80" stroke="var(--admin-border-subtle)" stroke-dasharray="3 3"/>
        <line x1="40" y1="130" x2="680" y2="130" stroke="var(--admin-border-subtle)" stroke-dasharray="3 3"/>

        <!-- Y Axis Labels -->
        <text x="15" y="34" fill="var(--admin-text-dim)" font-size="10" font-family="monospace">₹12K</text>
        <text x="15" y="84" fill="var(--admin-text-dim)" font-size="10" font-family="monospace">₹6K</text>
        <text x="15" y="134" fill="var(--admin-text-dim)" font-size="10" font-family="monospace">₹0</text>

        <!-- Previous Period (Dashed Line) -->
        <path d="M 40 120 Q 140 80, 240 100 T 440 90 T 640 60" fill="none" stroke="#6e6758" stroke-width="1.8" stroke-dasharray="4 4"/>

        <!-- Current Period (Smooth Bezier) -->
        <path d="M 40 125 Q 120 70, 200 95 T 360 45 T 520 80 T 660 30" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Fill under curve -->
        <path d="M 40 125 Q 120 70, 200 95 T 360 45 T 520 80 T 660 30 L 660 145 L 40 145 Z" fill="url(#blueGlow)"/>

        <!-- X Axis Labels -->
        <text x="40" y="165" fill="var(--admin-text-dim)" font-size="10">12:00 AM</text>
        <text x="340" y="165" fill="var(--admin-text-dim)" font-size="10">10:00 AM</text>
        <text x="620" y="165" fill="var(--admin-text-dim)" font-size="10">8:00 PM</text>
      </svg>
    `;
  }

  renderTotalSalesTimeSVG() {
    return `
      <svg class="chart-svg" viewBox="0 0 500 160">
        <line x1="30" y1="30" x2="480" y2="30" stroke="var(--admin-border-subtle)"/>
        <line x1="30" y1="80" x2="480" y2="80" stroke="var(--admin-border-subtle)"/>
        <line x1="30" y1="130" x2="480" y2="130" stroke="var(--admin-border-subtle)"/>

        <!-- Comparison dashed line -->
        <path d="M 30 110 C 110 90, 180 130, 260 70 S 380 90, 480 50" fill="none" stroke="#6e6758" stroke-width="1.5" stroke-dasharray="3 3"/>
        <!-- Main Line -->
        <path d="M 30 120 C 110 50, 180 90, 260 40 S 380 60, 480 30" fill="none" stroke="#3b82f6" stroke-width="2.2"/>
        <text x="30" y="152" fill="var(--admin-text-dim)" font-size="9">Feb 2026</text>
        <text x="180" y="152" fill="var(--admin-text-dim)" font-size="9">Jun 2026</text>
        <text x="340" y="152" fill="var(--admin-text-dim)" font-size="9">Oct 2026</text>
      </svg>
    `;
  }

  renderAOVChartSVG() {
    return `
      <svg class="chart-svg" viewBox="0 0 300 100">
        <path d="M 10 70 Q 70 65, 140 50 T 290 35" fill="none" stroke="#a3894f" stroke-width="2"/>
        <text x="10" y="92" fill="var(--admin-text-dim)" font-size="9">Feb</text>
        <text x="140" y="92" fill="var(--admin-text-dim)" font-size="9">Jun</text>
        <text x="260" y="92" fill="var(--admin-text-dim)" font-size="9">Oct</text>
      </svg>
    `;
  }

  renderSessionsChartSVG() {
    return `
      <svg class="chart-svg" viewBox="0 0 300 100">
        <path d="M 10 80 Q 80 40, 150 60 T 290 20" fill="none" stroke="#3b82f6" stroke-width="2"/>
      </svg>
    `;
  }

  renderConversionRateChartSVG() {
    return `
      <svg class="chart-svg" viewBox="0 0 300 100">
        <path d="M 10 60 Q 60 90, 120 40 T 220 80 T 290 30" fill="none" stroke="#10b981" stroke-width="2"/>
      </svg>
    `;
  }
  // --------------------------------------------------------------------------
  // INVENTORY VIEW
  // --------------------------------------------------------------------------
  renderInventoryView() {
    const el = document.getElementById('view-inventory');
    if (!el) return;
    const products = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

    const rows = products.map(p => {
      const inv = this.inventory[p.id] || {};
      const totalStock = Object.values(inv).reduce((a, b) => a + (b || 0), 0);
      const statusClass = totalStock === 0 ? 'badge-red' : totalStock < 10 ? 'badge-yellow' : 'badge-green';
      const statusLabel = totalStock === 0 ? 'Out of stock' : totalStock < 10 ? 'Low stock' : 'In stock';
      const sizeCells = sizes.map(sz => `
        <td class="inv-size-cell">
          <input
            type="number"
            class="inv-qty-input"
            value="${inv[sz] || 0}"
            min="0"
            data-pid="${p.id}"
            data-size="${sz}"
            aria-label="${p.name} ${sz} stock"
          />
        </td>`).join('');
      return `
        <tr class="inv-row">
          <td class="inv-product-cell">
            <span class="inv-product-name">${p.name}</span>
            <span class="inv-product-id">${p.id}</span>
          </td>
          ${sizeCells}
          <td class="inv-total-cell">${totalStock}</td>
          <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
          <td>
            <button class="action-btn" onclick="window.admin.saveInventoryRow('${p.id}')">Save</button>
          </td>
        </tr>`;
    }).join('');

    el.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Inventory</h1>
          <p class="page-subtitle">${products.length} product${products.length !== 1 ? 's' : ''} · Manage stock per size</p>
        </div>
      </div>
      <div class="admin-card">
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                ${sizes.map(s => `<th style="text-align:center">${s}</th>`).join('')}
                <th style="text-align:center">Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--admin-text-dim)">No products found. Add products first.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;

    // Wire up auto-save on blur
    el.querySelectorAll('.inv-qty-input').forEach(input => {
      input.addEventListener('change', () => {
        const pid = input.dataset.pid;
        const size = input.dataset.size;
        if (!this.inventory[pid]) this.inventory[pid] = {};
        this.inventory[pid][size] = parseInt(input.value, 10) || 0;
        this.saveInventory(this.inventory);
      });
    });
  }

  saveInventoryRow(pid) {
    const inputs = document.querySelectorAll(`.inv-qty-input[data-pid="${pid}"]`);
    if (!this.inventory[pid]) this.inventory[pid] = {};
    inputs.forEach(input => {
      this.inventory[pid][input.dataset.size] = parseInt(input.value, 10) || 0;
    });
    this.saveInventory(this.inventory);
    this.showToast('Inventory saved', 'success');
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // --------------------------------------------------------------------------
  // MARKETING VIEW
  // --------------------------------------------------------------------------
  renderMarketingView() {
    const el = document.getElementById('view-marketing');
    if (!el) return;
    el.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Marketing</h1>
          <p class="page-subtitle">Campaigns, automations &amp; audience insights</p>
        </div>
        <div class="header-action-group">
          <button class="btn btn-primary" onclick="window.admin.switchTab('discounts')">+ Create Discount</button>
        </div>
      </div>
      <div class="metrics-quad-grid" style="margin-bottom:2rem">
        ${this._mkMetricCard('Email Subscribers', '1,240', '+86 this week', '+7.4%', 'up')}
        ${this._mkMetricCard('Instagram Followers', '8,320', '+514 this month', '+6.6%', 'up')}
        ${this._mkMetricCard('Abandoned Carts', '18', '₹ 32,400 recoverable', '', 'neutral')}
        ${this._mkMetricCard('Repeat Purchase Rate', '34%', 'vs 28% last month', '+6%', 'up')}
      </div>
      <div class="analytics-grid-layout">
        <div class="admin-card">
          <div class="card-header-row"><h3 class="card-title">Active Campaigns</h3></div>
          <div class="orders-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Campaign</th><th>Type</th><th>Sent</th><th>Open Rate</th><th>Revenue</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Drop 1 Launch Email</td><td>Email</td><td>1,240</td><td>42.3%</td><td>₹18,400</td><td><span class="status-badge badge-green">Active</span></td></tr>
                <tr><td>Abandoned Cart Recovery</td><td>Automation</td><td>—</td><td>—</td><td>₹6,200</td><td><span class="status-badge badge-green">Active</span></td></tr>
                <tr><td>Win-Back (90-day)</td><td>Automation</td><td>—</td><td>—</td><td>₹1,800</td><td><span class="status-badge badge-yellow">Paused</span></td></tr>
                <tr><td>Summer Lookbook</td><td>Email</td><td>980</td><td>38.1%</td><td>₹11,200</td><td><span class="status-badge badge-red">Ended</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="admin-card">
          <div class="card-header-row"><h3 class="card-title">Top Traffic Sources</h3></div>
          <ul class="channel-list">
            <li class="channel-item"><span>Instagram / Organic</span><span class="channel-pct">42%</span></li>
            <li class="channel-item"><span>Direct</span><span class="channel-pct">26%</span></li>
            <li class="channel-item"><span>Google Organic</span><span class="channel-pct">14%</span></li>
            <li class="channel-item"><span>WhatsApp</span><span class="channel-pct">11%</span></li>
            <li class="channel-item"><span>Other</span><span class="channel-pct">7%</span></li>
          </ul>
        </div>
      </div>`;
  }

  _mkMetricCard(label, value, sub, change, dir) {
    const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '';
    const cls   = dir === 'up' ? 'metric-change-up' : dir === 'down' ? 'metric-change-down' : '';
    return `<div class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}</div>
      <div class="metric-sub">${sub}</div>
      ${change ? `<div class="metric-change ${cls}">${arrow} ${change}</div>` : ''}
    </div>`;
  }

  // --------------------------------------------------------------------------
  // ONLINE STORE VIEW
  // --------------------------------------------------------------------------
  renderOnlineStoreView() {
    const el = document.getElementById('view-online-store');
    if (!el) return;
    el.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Online Store</h1>
          <p class="page-subtitle">Storefront settings, themes &amp; navigation</p>
        </div>
        <div class="header-action-group">
          <a href="index.html" target="_blank" class="btn btn-primary">View Store ↗</a>
        </div>
      </div>
      <div class="analytics-grid-layout" style="grid-template-columns:1fr 1fr">
        <div class="admin-card">
          <div class="card-header-row"><h3 class="card-title">Theme</h3></div>
          <div style="padding:1rem 0;display:flex;flex-direction:column;gap:1rem">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-weight:600;color:var(--admin-text-main)">Tyche Dark Editorial</div>
                <div style="font-size:0.78rem;color:var(--admin-text-dim)">Current theme · Custom</div>
              </div>
              <span class="status-badge badge-green">Live</span>
            </div>
            <div style="font-size:0.82rem;color:var(--admin-text-muted)">
              Last published: Today · Version 3.0
            </div>
            <button class="btn btn-ghost" onclick="window.open('index.html','_blank')">Preview in new tab</button>
          </div>
        </div>
        <div class="admin-card">
          <div class="card-header-row"><h3 class="card-title">Store Settings</h3></div>
          <div style="padding:1rem 0;display:flex;flex-direction:column;gap:0.85rem">
            <div class="settings-row-item"><span>Store name</span><span>Tyche</span></div>
            <div class="settings-row-item"><span>Currency (default)</span><span>INR ₹</span></div>
            <div class="settings-row-item"><span>Multi-currency</span><span class="status-badge badge-green">Enabled (7 regions)</span></div>
            <div class="settings-row-item"><span>Password protection</span><span class="status-badge badge-red">Off</span></div>
            <div class="settings-row-item"><span>Checkout</span><span>Razorpay / Stripe</span></div>
          </div>
        </div>
        <div class="admin-card">
          <div class="card-header-row"><h3 class="card-title">Navigation</h3></div>
          <ul style="display:flex;flex-direction:column;gap:0.5rem;padding:0.75rem 0">
            <li style="font-size:0.84rem;color:var(--admin-text-muted)">Main Menu → Shop, Collections, About, Contact</li>
            <li style="font-size:0.84rem;color:var(--admin-text-muted)">Footer → Sizing, Returns, Privacy, T&amp;C</li>
          </ul>
        </div>
        <div class="admin-card">
          <div class="card-header-row"><h3 class="card-title">SEO &amp; Meta</h3></div>
          <div style="padding:0.75rem 0;display:flex;flex-direction:column;gap:0.65rem">
            <div class="settings-row-item"><span>Meta title</span><span style="font-size:0.78rem">Tyche — Streetwear Redefined</span></div>
            <div class="settings-row-item"><span>Google indexed</span><span class="status-badge badge-yellow">Pending</span></div>
            <div class="settings-row-item"><span>Sitemap</span><span style="font-size:0.78rem">Auto-generated</span></div>
          </div>
        </div>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // SOCIAL / INSTAGRAM VIEW
  // --------------------------------------------------------------------------
  renderSocialView() {
    const el = document.getElementById('view-social');
    if (!el) return;
    el.innerHTML = `
      <div class="page-header-row">
        <div class="page-title-group">
          <h1>Social &amp; Instagram</h1>
          <p class="page-subtitle">Connect channels, tag products &amp; track social revenue</p>
        </div>
      </div>
      <div class="metrics-quad-grid" style="margin-bottom:2rem">
        ${this._mkMetricCard('Instagram Reach', '42.8K', 'Last 30 days', '+18%', 'up')}
        ${this._mkMetricCard('Tagged Products', '12', 'Live in feed', '', 'neutral')}
        ${this._mkMetricCard('Social Revenue', '₹28,400', 'This month', '+31%', 'up')}
        ${this._mkMetricCard('Story Clicks', '3,240', 'Last 7 days', '+12%', 'up')}
      </div>
      <div class="admin-card">
        <div class="card-header-row"><h3 class="card-title">Connected Channels</h3></div>
        <div style="display:flex;flex-direction:column;gap:1rem;padding:0.5rem 0">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.85rem 0;border-bottom:1px solid var(--admin-border-subtle)">
            <div style="display:flex;align-items:center;gap:0.85rem">
              <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);display:flex;align-items:center;justify-content:center;font-size:1.1rem">📸</div>
              <div><div style="font-weight:600">Instagram</div><div style="font-size:0.78rem;color:var(--admin-text-dim)">@tyche.drop · 8,320 followers</div></div>
            </div>
            <span class="status-badge badge-green">Connected</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.85rem 0">
            <div style="display:flex;align-items:center;gap:0.85rem">
              <div style="width:36px;height:36px;border-radius:8px;background:#1877f2;display:flex;align-items:center;justify-content:center;font-size:1.1rem">👤</div>
              <div><div style="font-weight:600">Facebook</div><div style="font-size:0.78rem;color:var(--admin-text-dim)">Not connected</div></div>
            </div>
            <button class="btn btn-ghost" style="font-size:0.78rem">Connect</button>
          </div>
        </div>
      </div>`;
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.admin = new TycheAdmin();
});
