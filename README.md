# Little Luxe Gifts — Magic Moments, Beautifully Wrapped

A complete, modern e-commerce gift-shop website built with plain **HTML, CSS and
JavaScript** — no frameworks, no build step, no server-side code. It runs on any
static web host and loads quickly on desktop, tablet and mobile.

The shop uses **WhatsApp ordering**: customers add gifts to a basket and send a
ready-made order message to your WhatsApp (078 741 2314). There is no online
payment system — you confirm prices, stock and delivery directly with each
customer.

---

## 1. What's inside

```
little-luxe-gifts/
├─ index.html            The whole shop (homepage + catalogue in one page)
├─ styles.css            All styling (pink / lavender / cream / gold theme)
├─ app.js                Shop logic: search, filters, cart, WhatsApp orders
├─ products.json         Your product catalogue — EDIT THIS to manage products
├─ README.md             This file
├─ UPDATING-PRODUCTS.md  Step-by-step guide to edit products & prices
└─ assets/
   ├─ logo.svg           Brand logo
   ├─ favicon.svg        Browser-tab icon
   ├─ products/          Full-size product photos (product-001.jpg …)
   └─ thumbs/            Smaller thumbnails used in the grids (fast loading)
```

The catalogue contains **500 of your own product photographs**, de-duplicated
and organised into gift categories. No stock or AI images were used.

---

## 2. Run it on your computer

Because the shop loads `products.json` with JavaScript, most browsers need the
files to be served over `http://` rather than opened directly as a `file://`
path. Two easy options:

**Option A — quick local server (recommended)**

1. Install [Python](https://python.org) if you don't have it.
2. Open a terminal in the `little-luxe-gifts` folder.
3. Run:  `python3 -m http.server 8000`
4. Open your browser at:  `http://localhost:8000`

**Option B — VS Code**

1. Open the folder in Visual Studio Code.
2. Install the free “Live Server” extension.
3. Right-click `index.html` → “Open with Live Server”.

> Opening `index.html` by double-clicking may show an empty catalogue in some
> browsers (a browser security rule blocks local file loading). Use a server as
> above, or simply upload the site — online it always works.

---

## 3. Put it online (free and paid options)

The site is a plain static website, so hosting is simple and often free:

- **Netlify (drag & drop):** go to app.netlify.com → “Add new site” →
  “Deploy manually” → drag the whole `little-luxe-gifts` folder in. Done.
- **Cloudflare Pages / GitHub Pages / Vercel:** upload or connect the folder.
- **Any web host (cPanel / FTP):** upload the contents of `little-luxe-gifts`
  into your `public_html` (or `www`) folder.

After deploying, connect your own domain through the host's dashboard. Hosting,
domains and any optional paid services may incur fees from the provider.

---

## 4. Your business details (already set up)

- **Shop:** Little Luxe Gifts — *Magic Moments, Beautifully Wrapped.*
- **WhatsApp:** 078 741 2314  (used as `https://wa.me/27787412314`)
- **Address:** 255 Nightingale Street, Mofolo South, Soweto, 1801, South Africa

To change the WhatsApp number later, see **UPDATING-PRODUCTS.md**.

---

## 5. Features

- Homepage with hero banner, categories, featured / best-seller / new-arrival
  rails, special offers, testimonials and contact section.
- Live product **search** and **category filters** (only categories that have
  products are shown).
- **Shopping cart** with quantity controls, saved in the browser.
- **Quick-view** pop-up for every product, with variation and quantity choice.
- **“Add to Cart”** and **“Order on WhatsApp”** on every product.
- WhatsApp order message auto-fills product names, quantities, prices (when set)
  and an order total.
- Fully **mobile-responsive**; optimised, progressive images for fast loading.
- SEO-ready: meta tags, Open Graph, and local-business structured data.

---

## 6. Important notes before launch

- This is a **WhatsApp-ordering catalogue**, not an online payment checkout.
- **Prices are blank by default** (shown as “Enquire / price on request”) so you
  can add your own — the site never invents prices. See UPDATING-PRODUCTS.md.
- Confirm product names, prices, stock, delivery, returns and business hours
  before sharing the site publicly.
- Test the cart and a WhatsApp order on both a phone and a computer first.

Enjoy your new shop! 🎁
