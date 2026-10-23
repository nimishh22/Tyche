# TYCHE - Graphic Streetwear Platform



---

## Brand Identity & Aesthetic Guidelines

- **Brand Wordmark:** `TYCHE` with small decorative Greek lettering `ΤΥΧΗ`.
- **Streetwear Focus:** Graphic T-shirts, heavyweight 300 GSM combed cotton jersey, screenprinted visuals, boxy drop-shoulder silhouettes. Crafted in India.
- **Color Palette:**
  - Background: Deep Charcoal / Stone (`#141311`, `#1c1a17`)
  - Primary Text: Off-white bone (`#e9e3d5`)
  - Secondary Text: Dim bone-grey (`#b8b0a0`)
  - Accent 1 (CTAs/Highlights): Oxidized red-brown (`#8a3324`)
  - Accent 2 (Labels/Accents): Muted bronze/gold (`#a3894f`)
  - Borders: Dark warm grey hairline (`#3a352c`)
- **Geometry:** Minimal/sharp edges (`border-radius: 0px` to `2px`). No pill buttons.
- **Motion:** Purposeful, subtle scroll-reveal pop-ins and hover image-swaps. No cursor followers or gimmicky tech demos.

---

## Launch-Ready Checklist Verification

| Requirement | Status | Implementation Detail |
| :--- | :---: | :--- |
| **Custom Domain Connected** | Ready | DNS documentation & A/CNAME configuration guide included |
| **Site Favicon Added** | Verified | Custom vector SVG favicon in `assets/favicon.svg` |
| **No "Made with AI" Tag** | Verified | Zero AI builder badges or watermarks |
| **Real Privacy Policy Page** | Verified | Full GDPR & CCPA compliant policy view |
| **Real Terms & Conditions Page** | Verified | Comprehensive terms, shipping, returns, and IP clauses |

---

## Custom Domain Setup Instructions

To connect your custom domain (e.g. `tycheclothing.com` or `tychebrand.com`):

1. **Log in to your DNS registrar** (Namecheap, Cloudflare, GoDaddy, Google Domains).
2. **Add the Root Domain (Apex) Record**:
   - **Type**: `A`
   - **Host / Name**: `@`
   - **Value**: `76.76.21.21` (or your edge server IP)
   - **TTL**: `3600` (1 Hour)
3. **Add the Subdomain (WWW) Record**:
   - **Type**: `CNAME`
   - **Host / Name**: `www`
   - **Value**: `cname.tycheclothing.com`
   - **TTL**: `3600`
4. **SSL / HTTPS Provisioning**:
   - Automated via Let's Encrypt / Cloudflare Edge Certificates.

---

## Running Locally

To serve and test the application locally:

```bash
cd "/Users/nimish/.gemini/antigravity-ide/scratch/theseus-streetwear"
npm install
npm run dev
```

Then navigate to `http://localhost:8080` in your web browser.
