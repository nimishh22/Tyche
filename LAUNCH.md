# TYCHE — Weekend launch checklist

Target: live storefront on **Vercel** with **real payments** (India + international) via **Stripe Checkout**.

## Before you deploy

### 1. Stripe account

1. Create or log in at [stripe.com](https://stripe.com).
2. Turn on **India** and other countries you ship to (Settings → Business → Countries).
3. Copy **test** keys first (`sk_test_…`), then **live** keys (`sk_live_…`) when you go live.
4. In the Vercel project → **Settings → Environment Variables**, add:
   - `STRIPE_SECRET_KEY` — your secret key (never commit this)
   - `SITE_URL` — e.g. `https://tyche-streetwear.vercel.app` (your production URL)

### 2. Product photos

Messi Tee assets are in `assets/images/prod_messi_*`. Add or swap files there if you reshoot.

### 3. Contact emails

Search the repo for `tycheclothing.com` and set your real support / privacy addresses before launch.

## Deploy to Vercel

```bash
cd "/Users/nimish/.gemini/antigravity-ide/scratch/theseus-streetwear"
npm install
npx vercel login
npx vercel          # preview
npx vercel --prod   # production
```

Or connect the GitHub repo in the Vercel dashboard after pushing.

## How checkout works now

1. Customer fills **contact + shipping** on your site.
2. **Place order** calls `/api/create-checkout-session` (prices are recalculated on the server).
3. Customer pays on **Stripe’s hosted page** (cards; Apple Pay / Google Pay where Stripe enables them).
4. Success redirect clears the cart and shows confirmation.

The old on-page card fields are removed — you must not collect card numbers on your own site without PCI compliance.

## India note (UPI)

Stripe Checkout covers **cards** globally. If you need **UPI** at volume in India, add **Razorpay** as a second path later; that usually needs a small backend or payment links.

## Custom domain

After Vercel gives you a URL, add your domain under **Vercel → Domains**, then at your registrar:

- Apex: `A` → `76.76.21.21`
- `www`: `CNAME` → `cname.vercel-dns.com`

Update `SITE_URL` to your custom domain when it’s live.

## Admin dashboard

`admin.html` is a **local demo** (sample orders in browser storage). It is **not** wired to Stripe yet. Fulfill orders from the **Stripe Dashboard → Payments** until you connect webhooks.

## Test card (Stripe test mode)

- Number: `4242 4242 4242 4242`
- Any future expiry, any CVC, any billing ZIP.
