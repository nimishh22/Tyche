/** Keep in sync with js/products.js — server-side source of truth for checkout amounts */

export const REGIONS = {
  IN: { currency: 'inr', shippingThreshold: 2500, shippingCost: 99 },
  US: { currency: 'usd', shippingThreshold: 100, shippingCost: 12 },
  UK: { currency: 'gbp', shippingThreshold: 80, shippingCost: 10 },
  EU: { currency: 'eur', shippingThreshold: 90, shippingCost: 10 },
  CA: { currency: 'cad', shippingThreshold: 130, shippingCost: 15 },
  AU: { currency: 'aud', shippingThreshold: 150, shippingCost: 18 },
  AE: { currency: 'aed', shippingThreshold: 350, shippingCost: 45 },
  SG: { currency: 'sgd', shippingThreshold: 130, shippingCost: 15 },
  CN: { currency: 'cny', shippingThreshold: 700, shippingCost: 80 }
};

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

export const PRODUCTS = {
  'th-tee-01': { name: 'Frank Ocean Blond Tee', priceINR: 1200, priceUSD: 36 },
  'th-tee-02': { name: 'YVL VAMP Tee', priceINR: 1299, priceUSD: 38 },
  'th-tee-03': { name: 'Messi Tee', priceINR: 1200, priceUSD: 35 }
};

export function getUnitPrice(productId, regionCode) {
  const product = PRODUCTS[productId];
  if (!product) return null;

  const inr = product.priceINR;
  if (regionCode === 'IN') return inr;

  const baseUSD = product.priceUSD || Math.round((inr / 1200) * 36);
  if (regionCode === 'US') return baseUSD;

  const reg = REGIONS[regionCode] || REGIONS.IN;
  const currencyKey = reg.currency.toUpperCase();
  const rate = DEFAULT_RATES[currencyKey] || 1.0;
  return Math.round(baseUSD * rate);
}

export function getCurrency(regionCode) {
  return (REGIONS[regionCode] || REGIONS.IN).currency;
}

/** Stripe expects amounts in the smallest currency unit (e.g. paise, cents). */
export function toStripeAmount(amount, currency) {
  const zeroDecimal = ['jpy', 'krw', 'vnd'];
  if (zeroDecimal.includes(currency)) return Math.round(amount);
  return Math.round(amount * 100);
}
