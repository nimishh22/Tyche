/* ==========================================================================
   TYCHE PRODUCT CATALOG & REGIONAL PRICING ENGINE — DROP 01
   Graphic streetwear for the images, ideas and references worth wearing.
   Focused exclusively on heavyweight graphic T-shirts.
   ========================================================================== */

const REGIONS = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    format: (val) => `₹${Math.round(val).toLocaleString('en-IN')}`,
    shippingThreshold: 2500,
    shippingThresholdText: '₹2,500',
    shippingCost: 99
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    format: (val) => `$${Math.round(val)}.00`,
    shippingThreshold: 100,
    shippingThresholdText: '$100.00',
    shippingCost: 12
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    format: (val) => `£${Math.round(val)}.00`,
    shippingThreshold: 80,
    shippingThresholdText: '£80.00',
    shippingCost: 10
  },
  EU: {
    code: 'EU',
    name: 'Europe (Germany/FR/NL)',
    flag: '🇪🇺',
    currency: 'EUR',
    symbol: '€',
    format: (val) => `€${Math.round(val)}.00`,
    shippingThreshold: 90,
    shippingThresholdText: '€90.00',
    shippingCost: 10
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'CA$',
    format: (val) => `CA$${Math.round(val)}.00`,
    shippingThreshold: 130,
    shippingThresholdText: 'CA$130.00',
    shippingCost: 15
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    format: (val) => `A$${Math.round(val)}.00`,
    shippingThreshold: 150,
    shippingThresholdText: 'A$150.00',
    shippingCost: 18
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED ',
    format: (val) => `${Math.round(val)} AED`,
    shippingThreshold: 350,
    shippingThresholdText: '350 AED',
    shippingCost: 45
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: 'SG$',
    format: (val) => `SG$${Math.round(val)}.00`,
    shippingThreshold: 130,
    shippingThresholdText: 'SG$130.00',
    shippingCost: 15
  },
  CN: {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currency: 'CNY',
    symbol: '¥',
    format: (val) => `¥${Math.round(val)}`,
    shippingThreshold: 700,
    shippingThresholdText: '¥700',
    shippingCost: 80
  }
};

/**
 * PRODUCT CATALOG
 * Future products added here only need:
 * - priceINR (e.g. 1200 or 1500)
 * - priceUSD (optional, defaults automatically to (priceINR / 1200) * 36)
 * All other international currencies automatically calculate daily using live exchange rates!
 */
const PRODUCTS = [
  {
    id: 'th-tee-01',
    name: 'Frank Ocean Blond Tee',
    category: 't-shirts',
    categoryLabel: 'Graphic Tee',
    priceINR: 1200,
    priceUSD: 36,
    color: 'Vintage White',
    badge: 'DROP 01',
    badgeType: 'tag-heavy',
    isFeatured: true,
    isFavourite: true,
    images: {
      primary: 'assets/images/prod_blondtee_model_front.jpg',
      secondary: 'assets/images/prod_blondtee_model_back.jpg',
      gallery: [
        'assets/images/prod_blondtee_model_front.jpg',
        'assets/images/prod_blondtee_model_back.jpg',
        'assets/images/prod_blondtee_front.png',
        'assets/images/prod_blondtee_back.png'
      ]
    },
    description: 'You saved the reference. We put it on heavyweight cotton. Features the Blond album graphic on the front and "We\'ll never be those kids again" text print across the back. 300 GSM combed cotton with a relaxed boxy drape.',
    specs: {
      weight: '300 GSM Heavy Single Jersey',
      fit: 'Relaxed Boxy / Dropped Shoulders',
      neckband: '1.25" Dense Rib Collar',
      wash: 'Vintage Washed White',
      origin: 'Crafted in India'
    },
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'th-tee-02',
    name: 'YVL VAMP Tee',
    category: 't-shirts',
    categoryLabel: 'Graphic Tee',
    priceINR: 1299,
    priceUSD: 38,
    color: 'Vintage Sunfade Black',
    badge: 'BESTSELLER',
    badgeType: 'tag-new',
    isFeatured: true,
    isFavourite: true,
    images: {
      primary: 'assets/images/prod_yvl_model_front_new.jpg',
      secondary: 'assets/images/prod_yvl_model_back_new.jpg',
      gallery: [
        'assets/images/prod_yvl_model_front_new.jpg',
        'assets/images/prod_yvl_model_back_new.jpg',
        'assets/images/prod_yvl_flat_front.jpg',
        'assets/images/prod_yvl_flat_back.jpg'
      ]
    },
    description: 'Chest emblem upfront, oversized skeletal x-ray print on the reverse. Printed on 300 GSM combed jersey with a faded sun-bleached wash. Made for the saved folder.',
    specs: {
      weight: '300 GSM Heavy Single Jersey',
      fit: 'Oversized Boxy Fit',
      print: 'High-Density Screenprint',
      wash: 'Vintage Sunfade Black',
      origin: 'Crafted in India'
    },
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'th-tee-03',
    name: 'Messi Tee',
    category: 't-shirts',
    categoryLabel: 'Graphic Tee',
    priceINR: 1200,
    priceUSD: 35,
    color: 'Vintage White',
    badge: 'DROP 01',
    badgeType: 'tag-heavy',
    isFeatured: true,
    isFavourite: true,
    images: {
      primary: 'assets/images/prod_messi_model_back.jpg',
      secondary: 'assets/images/prod_messi_model_front.jpg',
      gallery: [
        'assets/images/prod_messi_model_back.jpg',
        'assets/images/prod_messi_model_front.jpg',
        'assets/images/prod_messi_flat_back.png'
      ]
    },
    description: 'Football elegance on heavyweight cotton. Clean vintage white tee with a centered back graphic — MESSI portrait, “Football Elegance,” and world-class details. 300 GSM combed jersey, relaxed boxy fit, screenprinted in India.',
    specs: {
      weight: '300 GSM Heavy Single Jersey',
      fit: 'Relaxed Boxy / Dropped Shoulders',
      print: 'High-Density Screenprint',
      wash: 'Vintage White',
      origin: 'Crafted in India'
    },
    sizes: ['S', 'M', 'L', 'XL']
  }
];

window.REGIONS = REGIONS;
window.PRODUCTS = PRODUCTS;
