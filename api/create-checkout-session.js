import Stripe from 'stripe';
import {
  getUnitPrice,
  getCurrency,
  toStripeAmount,
  REGIONS,
  PRODUCTS
} from './lib/catalog.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ALLOWED_COUNTRIES = [
  'IN', 'US', 'GB', 'DE', 'FR', 'NL', 'ES', 'IT', 'CA', 'AU', 'AE', 'SG', 'CN'
];

function siteOrigin(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({
      error: 'Payments are not configured yet. Add STRIPE_SECRET_KEY in Vercel environment variables.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      region = 'IN',
      items = [],
      email,
      phone,
      shipping = {}
    } = body;

    if (!email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Email and cart items are required.' });
    }

    const regionConfig = REGIONS[region];
    if (!regionConfig) {
      return res.status(400).json({ error: 'Invalid region.' });
    }

    const currency = getCurrency(region);
    const lineItems = [];
    let subtotal = 0;

    for (const row of items) {
      const { productId, size, quantity } = row;
      const qty = Math.min(Math.max(parseInt(quantity, 10) || 1, 1), 10);
      const unit = getUnitPrice(productId, region);
      const product = PRODUCTS[productId];

      if (unit == null || !product) {
        return res.status(400).json({ error: `Unknown product: ${productId}` });
      }

      subtotal += unit * qty;
      lineItems.push({
        quantity: qty,
        price_data: {
          currency,
          unit_amount: toStripeAmount(unit, currency),
          product_data: {
            name: product.name,
            description: `Size ${size || 'M'} • Drop 01`,
            metadata: {
              productId,
              size: size || 'M'
            }
          }
        }
      });
    }

    const shippingCost =
      subtotal >= regionConfig.shippingThreshold ? 0 : regionConfig.shippingCost;

    if (shippingCost > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency,
          unit_amount: toStripeAmount(shippingCost, currency),
          product_data: {
            name: 'Tracked express shipping',
            description: 'Door-to-door courier'
          }
        }
      });
    }

    const orderRef = `TH-${Math.floor(100000 + Math.random() * 900000)}`;
    const origin = siteOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: lineItems,
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&order=${orderRef}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
      payment_method_types: ['card'],
      metadata: {
        orderRef,
        region,
        phone: phone || '',
        shipName: [shipping.firstName, shipping.lastName].filter(Boolean).join(' '),
        shipLine1: shipping.address || '',
        shipLine2: shipping.suite || '',
        shipCity: shipping.city || '',
        shipPostal: shipping.postal || ''
      }
    });

    return res.status(200).json({ url: session.url, orderRef });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({
      error: err.message || 'Could not start checkout.'
    });
  }
}
