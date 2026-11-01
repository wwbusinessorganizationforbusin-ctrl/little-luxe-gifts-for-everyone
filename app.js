/* ================================================================
   Little Luxe Gifts — Shop logic
   Products · Search · Category filters · Cart · WhatsApp ordering
   ================================================================ */
'use strict';

const WA_NUMBER = '27787412314';           // 078 741 2314 -> international
const WA_NUMBER_LOCAL = '078 741 2314';
const PRICE_PENDING = 'Enquire';           // shown when a product has no price yet

/* ---------- Category metadata (order + emoji + blurb) ---------- */
const CATEGORY_META = [
  { name:'Birthday Gifts',              icon:'🎂', blurb:'Make their day unforgettable' },
  { name:'Gifts for Her',               icon:'💖', blurb:'Beautiful treats she will adore' },
  { name:'Gifts for Him',               icon:'🎁', blurb:'Thoughtful picks he will love' },
  { name:'Gifts for Kids',              icon:'🧸', blurb:'Joy for little ones' },
  { name:'Baby Gifts',                  icon:'🍼', blurb:'Sweet welcomes for new arrivals' },
  { name:'Toys and Playtime',           icon:'🚗', blurb:'Hours of happy play' },
  { name:'Gift Boxes and Hampers',      icon:'🎀', blurb:'Beautifully wrapped surprises' },
  { name:'Personalised Gifts',          icon:'✨', blurb:'Made personal, made special' },
  { name:'Special Occasion Gifts',      icon:'🥂', blurb:'For moments worth celebrating' },
  { name:'Christmas Gifts',             icon:'🎄', blurb:'Festive magic &amp; stocking fillers' },
  { name:"Valentine's Day Gifts",       icon:'💝', blurb:'Say it with something lovely' },
  { name:'Party Gifts and Accessories', icon:'🎉', blurb:'Fun favours & party sparkle' },
];

/* ---------- State ---------- */
let ALL_PRODUCTS = [];
let state = {
  category: 'All',
  query: '',
  sort: 'featured',
  page: 1,
  perPage: 24,
  railTab: 'featured',
};
let cart = [];           // [{id, qty, variant}]
let favourites = [];     // product ids

/* ---------- Helpers ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = id => ALL_PRODUCTS.find(p => p.id === id);

function money(p){
  if (p.price && String(p.price).trim() !== '') {
    return /^R/i.test(p.price) ? p.price : 'R' + p.price;
  }
  return PRICE_PENDING;
}

function variantList(p){
  if (!p.options) return [];
  return String(p.options).split(/[,/|]/).map(s => s.trim()).filter(Boolean);
}

function showToast(msg){
  const t = $('#toast');
  if(!t) return;
  t.innerHTML = '<span>✔</span>' + esc(msg);
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.hidden = true, 300);
  }, 2200);
}

/* ---------- Persistence ---------- */
function save(){
  try{
    localStorage.setItem('llg_cart', JSON.stringify(cart));
    localStorage.setItem('llg_favs', JSON.stringify(favourites));
  }catch(e){ /* storage may be unavailable */ }
}
function load(){
  try{
    cart = JSON.parse(localStorage.getItem('llg_cart') || '[]') || [];
    favourites = JSON.parse(localStorage.getItem('llg_favs') || '[]') || [];
  }catch(e){ cart = []; favourites = []; }
}

/* ---------- Catalogue load ---------- */
async function loadCatalogue(){
  try{
    const res = await fetch('products.json', { cache:'no-cache' });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    ALL_PRODUCTS = await res.json();
  }catch(err){
    console.error('Could not load products.json', err);
    $('#productGrid').innerHTML =
      '<div class="empty-state"><span>⚠️</span><h3>Products unavailable</h3>' +
      '<p>Please view this website through a local web server or a web host so the product catalogue can load.</p></div>';
    return;
  }
  renderHeroCollage();
  renderCategories();
  renderChips();
  renderRail();
  renderGrid();
  updateCartUI();
}

/* ---------- Design helpers ---------- */
function productTags(p){ return p.tags && p.tags.length ? p.tags : [p.category]; }
function inCategory(p, cat){
  return cat === 'All' || p.category === cat || productTags(p).includes(cat);
}

/* ---------- Hero collage ---------- */
function renderHeroCollage(){
  const box = $('#heroCollage');
  if(!box) return;
  const picks = [];
  const wanted = ['Gift Boxes and Hampers','Gifts for Her','Toys and Playtime','Christmas Gifts',
                  'Gifts for Kids','Valentine\'s Day Gifts'];
  wanted.forEach(c => { const m = ALL_PRODUCTS.find(p => p.category === c); if(m) picks.push(m); });
  let i = 0;
  while(picks.length < 3 && i < ALL_PRODUCTS.length){ if(!picks.includes(ALL_PRODUCTS[i])) picks.push(ALL_PRODUCTS[i]); i++; }
  const labels = ['Bestseller','Lovely','New'];
  box.innerHTML = picks.slice(0,3).map((p, k) => `
    <div class="hc">
      <img src="${esc(p.image || p.thumb)}" alt="${esc(p.name)}" loading="${k===0?'eager':'lazy'}">
      <span class="hc-badge">${esc(labels[k] || 'Gift')}</span>
    </div>`).join('');
}

/* ---------- Categories ---------- */
function countFor(cat){
  return ALL_PRODUCTS.filter(p => inCategory(p, cat)).length;
}
function renderCategories(){
  const grid = $('#catGrid');
  if(!grid) return;
  grid.innerHTML = CATEGORY_META.map(c => {
    const n = countFor(c.name);
    if (n === 0) return '';                       // only show categories with products
    const cover = ALL_PRODUCTS.find(p => p.category === c.name || productTags(p).includes(c.name));
    const img = cover ? (cover.image || cover.thumb) : '';
    return `
      <button class="cat-card" data-cat="${esc(c.name)}" aria-label="Shop ${esc(c.name)}">
        <div class="cat-media"><img src="${esc(img)}" alt="${esc(c.name)}" loading="lazy"></div>
        <div class="cat-body">
          <h3>${c.icon} ${esc(c.name)}</h3>
          <span>${esc(c.blurb)} &middot; ${n} gift${n===1?'':'s'}</span>
          <span class="go">→</span>
        </div>
      </button>`;
  }).join('');
}

/* ---------- Filter chips ---------- */
function renderChips(){
  const box = $('#filterChips');
  if(!box) return;
  const cats = CATEGORY_META.filter(c => countFor(c.name) > 0);
  const total = ALL_PRODUCTS.length;
  box.innerHTML =
    `<button class="chip active" data-cat="All">All Gifts <small>(${total})</small></button>` +
    cats.map(c => `<button class="chip" data-cat="${esc(c.name)}">${esc(c.name)} <small>(${countFor(c.name)})</small></button>`).join('');
}

/* ---------- Card markup ---------- */
function cardHTML(p, badge){
  const variants = variantList(p);
  const fav = favourites.includes(p.id) ? 'on' : '';
  const desc = p.description || 'A lovely gift from our boutique collection.';
  return `
  <article class="product-card" data-id="${p.id}">
    <div class="pc-media" data-quick="${p.id}">
      ${badge ? `<span class="pc-badge">${esc(badge)}</span>` : ''}
      <img src="${esc(p.image || p.thumb)}" alt="${esc(p.name)}" loading="lazy" width="800" height="800">
      <span class="pc-quick">Quick view</span>
    </div>
    <button class="pc-fav ${fav}" data-fav="${p.id}" aria-label="Save ${esc(p.name)}">♥</button>
    <div class="pc-body">
      <span class="pc-cat">${esc(p.category)}</span>
      <h3 class="pc-name">${esc(p.name)}</h3>
      <p class="pc-desc">${esc(desc)}</p>
      ${variants.length ? `<div class="pc-variants">${variants.slice(0,3).map(v => `<span>${esc(v)}</span>`).join('')}</div>` : ''}
      <div class="pc-price">${esc(money(p))}${p.price ? '' : ' <small>&middot; price on request</small>'}</div>
      <div class="pc-actions">
        <button class="btn btn-primary" data-add="${p.id}"><span>Add to Cart</span></button>
        <button class="wa-mini" data-wa="${p.id}" aria-label="Order ${esc(p.name)} on WhatsApp" title="Order on WhatsApp">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20z"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

/* ---------- Rails (Featured / Best sellers / New) ---------- */
function railProducts(tab){
  const withPrice = ALL_PRODUCTS.filter(p => p.price);
  const pool = withPrice.length > 6 ? withPrice : ALL_PRODUCTS;
  if (tab === 'bestsellers') return pool.slice(0, 8);
  if (tab === 'new')         return pool.slice(-8).reverse();
  // featured: mix one from each category for variety
  const seen = new Set(), out = [];
  for (const c of CATEGORY_META){
    const m = ALL_PRODUCTS.find(p => (p.category === c.name) && !seen.has(p.id));
    if (m){ seen.add(m.id); out.push(m); }
  }
  for (const p of pool){ if (out.length >= 8) break; if(!seen.has(p.id)){ seen.add(p.id); out.push(p); } }
  return out.slice(0, 8);
}
function renderRail(){
  const rail = $('#productRail');
  const title = $('#railTitle');
  if(!rail) return;
  const map = { featured:'Featured Gifts', bestsellers:'Best Sellers', new:'New Arrivals' };
  if(title) title.textContent = map[state.railTab] || 'Featured Gifts';
  const badge = state.railTab === 'new' ? 'New' : (state.railTab === 'bestsellers' ? 'Popular' : 'Featured');
  rail.innerHTML = railProducts(state.railTab).map(p => cardHTML(p, badge)).join('');
}

/* ---------- Grid (Shop all) ---------- */
function filtered(){
  let list = ALL_PRODUCTS.filter(p => inCategory(p, state.category));
  if (state.query){
    const q = state.query.toLowerCase();
    list = list.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q) ||
      (p.category||'').toLowerCase().includes(q) ||
      productTags(p).some(t => t.toLowerCase().includes(q))
    );
  }
  if (state.sort === 'az') list = list.slice().sort((a,b) => a.name.localeCompare(b.name));
  else if (state.sort === 'za') list = list.slice().sort((a,b) => b.name.localeCompare(a.name));
  else if (state.sort === 'cat') list = list.slice().sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return list;
}
function renderGrid(reset){
  const grid = $('#productGrid');
  const more = $('#loadMoreBtn');
  const empty = $('#emptyState');
  if(!grid) return;
  const list = filtered();
  const shown = list.slice(0, state.page * state.perPage);

  $('#resultsLine').textContent =
    list.length
      ? `Showing ${shown.length} of ${list.length} ${state.category === 'All' ? 'gifts' : state.category + ' gifts'}`
      : 'No gifts match your search.';

  if (reset) grid.innerHTML = '';
  grid.innerHTML = shown.map(p => cardHTML(p, '')).join('');
  empty.hidden = list.length !== 0;
  more.style.display = shown.length < list.length ? '' : 'none';
}

/* ---------- Cart ---------- */
function addToCart(id, qty=1, variant=''){
  const p = byId(id); if(!p) return;
  const key = id + '|' + variant;
  const found = cart.find(c => (c.id + '|' + c.variant) === key);
  if (found) found.qty += qty;
  else cart.push({ id, qty, variant });
  save(); updateCartUI();
  showToast(`${p.name} added to your basket`);
  openCart();
}
function setQty(id, variant, qty){
  const key = id + '|' + variant;
  const it = cart.find(c => (c.id + '|' + c.variant) === key);
  if(!it) return;
  it.qty = qty;
  if (it.qty <= 0) cart = cart.filter(c => (c.id + '|' + c.variant) !== key);
  save(); updateCartUI(); renderCartBody();
}
function removeItem(id, variant){
  cart = cart.filter(c => (c.id + '|' + c.variant) !== (id + '|' + variant));
  save(); updateCartUI(); renderCartBody();
}
function cartCount(){ return cart.reduce((n,c) => n + c.qty, 0); }
function cartTotal(){
  let total = 0, priced = 0, unknown = 0;
  cart.forEach(c => {
    const p = byId(c.id); if(!p) return;
    const num = parseFloat(String(p.price||'').replace(/[^0-9.]/g,''));
    if (!isNaN(num) && num > 0){ total += num * c.qty; priced++; }
    else unknown += c.qty;
  });
  return { total, priced, unknown };
}
function updateCartUI(){
  const cc = $('#cartCount');
  if(cc) cc.textContent = cartCount();
  const t = cartTotal();
  const el = $('#cartTotal');
  if(el) el.textContent = (t.priced ? 'R' + t.total.toFixed(2) : '') + (t.unknown ? (t.priced ? ' + ' : '') + 'Enquire' : (t.priced ? '' : 'Enquire'));
  renderCartBody();
}
function renderCartBody(){
  const body = $('#cartBody');
  if(!body) return;
  if(!cart.length){
    body.innerHTML = `<div class="cart-empty"><span>🛍️</span><p>Your gift basket is empty.<br>Add a little something lovely.</p></div>`;
    return;
  }
  body.innerHTML = cart.map(c => {
    const p = byId(c.id); if(!p) return '';
    return `
    <div class="cart-item">
      <img src="${esc(p.thumb || p.image)}" alt="${esc(p.name)}">
      <div class="ci-info">
        <h4>${esc(p.name)}</h4>
        ${c.variant ? `<div class="ci-price">${esc(c.variant)}</div>` : ''}
        <div class="ci-price">${esc(money(p))}</div>
        <div class="ci-qty">
          <button data-dec="${p.id}" data-variant="${esc(c.variant||'')}" aria-label="Decrease quantity">−</button>
          <span>${c.qty}</span>
          <button data-inc="${p.id}" data-variant="${esc(c.variant||'')}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="ci-remove" data-rm="${p.id}" data-variant="${esc(c.variant||'')}">Remove</button>
    </div>`;
  }).join('');
}
function openCart(){
  const d = $('#cartDrawer'), o = $('#overlay');
  d.classList.add('open'); d.setAttribute('aria-hidden','false');
  o.hidden = false; requestAnimationFrame(() => o.classList.add('show'));
  document.body.style.overflow = 'hidden';
}
function closeCart(){
  const d = $('#cartDrawer'), o = $('#overlay');
  d.classList.remove('open'); d.setAttribute('aria-hidden','true');
  o.classList.remove('show'); setTimeout(() => o.hidden = true, 300);
  document.body.style.overflow = '';
}

/* ---------- WhatsApp order messages ---------- */
function waLink(text){
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
function cartMessage(){
  const lines = ['Hello Little Luxe Gifts! 🎁', '', 'I would like to order the following:', ''];
  cart.forEach((c,i) => {
    const p = byId(c.id); if(!p) return;
    const priceTxt = p.price ? ` (${money(p)})` : ' (price to confirm)';
    lines.push(`${i+1}. ${p.name}${c.variant ? ' — ' + c.variant : ''} x${c.qty}${priceTxt}`);
  });
  const t = cartTotal();
  lines.push('');
  if (t.priced) lines.push(`Estimated total: R${t.total.toFixed(2)}`);
  if (t.unknown) lines.push(`Items marked "price to confirm": ${t.unknown} — please advise the price.`);
  lines.push('');
  lines.push('Could you please confirm availability, pricing and delivery? Thank you!');
  return lines.join('\n');
}
function productMessage(p, qty=1, variant=''){
  return [
    'Hello Little Luxe Gifts! 🎁',
    '',
    `I'm interested in this gift: ${p.name}`,
    variant ? `Option: ${variant}` : '',
    `Quantity: ${qty}`,
    p.price ? `Price: ${money(p)}` : 'Price: please confirm',
    '',
    'Could you please confirm availability, price and delivery? Thank you!'
  ].filter(Boolean).join('\n');
}

/* ---------- Quick view modal ---------- */
let modalQty = 1, modalVariant = '';
function openModal(id){
  const p = byId(id); if(!p) return;
  modalQty = 1; modalVariant = '';
  const variants = variantList(p);
  $('#modalGrid').innerHTML = `
    <div class="mg-media"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div>
    <div class="mg-body">
      <span class="mg-cat">${esc(p.category)}</span>
      <h2>${esc(p.name)}</h2>
      <p class="mg-desc">${esc(p.description || 'A lovely gift from our boutique collection.')}</p>
      <div class="mg-price">${esc(money(p))}${p.price ? '' : ' <small style="font-weight:500;color:var(--ink-soft)">· price on request</small>'}</div>
      ${variants.length ? `<div class="mg-variants" id="mgVariants">${variants.map(v => `<button data-variant="${esc(v)}">${esc(v)}</button>`).join('')}</div>` : ''}
      <div class="mg-qty">
        <span style="font-size:.85rem;font-weight:600;color:var(--purple-deep)">Quantity</span>
        <div class="qty-ctrl">
          <button id="mgDec" aria-label="Decrease">−</button><span id="mgQty">1</span><button id="mgInc" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="mg-actions">
        <button class="btn btn-primary" id="mgAdd">Add to Cart</button>
        <a class="btn btn-whatsapp" id="mgWA" href="${waLink(productMessage(p,1,''))}" target="_blank" rel="noopener">Order on WhatsApp</a>
      </div>
      <p class="mg-note">Prices and availability are confirmed by Little Luxe Gifts on WhatsApp.</p>
    </div>`;

  $('#mgDec').onclick = () => { modalQty = Math.max(1, modalQty-1); $('#mgQty').textContent = modalQty; refreshModalWA(p); };
  $('#mgInc').onclick = () => { modalQty = Math.min(99, modalQty+1); $('#mgQty').textContent = modalQty; refreshModalWA(p); };
  $('#mgAdd').onclick = () => { addToCart(p.id, modalQty, modalVariant); closeModal(); };
  if (variants.length){
    $$('#mgVariants button').forEach(b => b.onclick = () => {
      modalVariant = b.dataset.variant;
      $$('#mgVariants button').forEach(x => x.classList.toggle('on', x === b));
      refreshModalWA(p);
    });
  }
  const modal = $('#productModal');
  modal.hidden = false; document.body.style.overflow = 'hidden';
}
function refreshModalWA(p){
  const a = $('#mgWA'); if(a) a.href = waLink(productMessage(p, modalQty, modalVariant));
}
function closeModal(){ $('#productModal').hidden = true; document.body.style.overflow = ''; }

/* ---------- Favourites ---------- */
function toggleFav(id, btn){
  if (favourites.includes(id)) favourites = favourites.filter(x => x !== id);
  else { favourites.push(id); showToast('Saved to your favourites ♥'); }
  if(btn) btn.classList.toggle('on');
  save();
}

/* ---------- Wiring ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = $('#year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
  load();

  // header shadow
  const header = $('#siteHeader');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive:true });

  // mobile menu
  const nav = $('#mainNav'), menuBtn = $('#menuToggle');
  menuBtn && menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // search overlay
  const so = $('#searchOverlay');
  $('#searchToggle') && $('#searchToggle').addEventListener('click', () => {
    so.hidden = !so.hidden;
    if(!so.hidden) setTimeout(() => $('#searchInput').focus(), 60);
  });
  $('#searchClose') && $('#searchClose').addEventListener('click', () => so.hidden = true);
  $('#searchForm') && $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    state.query = $('#searchInput').value.trim();
    state.category = 'All'; state.page = 1;
    setActiveChip('All');
    renderGrid(true);
    so.hidden = true;
    document.getElementById('shop').scrollIntoView({ behavior:'smooth' });
  });
  $('#searchInput') && $('#searchInput').addEventListener('input', e => {
    state.query = e.target.value.trim();
    state.page = 1; renderGrid(true);
  });

  // cart open/close
  $('#cartToggle') && $('#cartToggle').addEventListener('click', openCart);
  $('#cartClose') && $('#cartClose').addEventListener('click', closeCart);
  $('#overlay') && $('#overlay').addEventListener('click', closeCart);
  $('#cartClear') && $('#cartClear').addEventListener('click', () => {
    if(cart.length && confirm('Clear your whole basket?')){ cart = []; save(); updateCartUI(); showToast('Basket cleared'); }
  });
  $('#cartWhatsApp') && $('#cartWhatsApp').addEventListener('click', () => {
    if(!cart.length){ showToast('Your basket is empty'); return; }
    window.open(waLink(cartMessage()), '_blank');
  });

  // rail tabs
  $$('.rail-tab').forEach(t => t.addEventListener('click', () => {
    $$('.rail-tab').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
    t.classList.add('active'); t.setAttribute('aria-selected','true');
    state.railTab = t.dataset.rail; renderRail();
  }));

  // sort
  $('#sortSelect') && $('#sortSelect').addEventListener('change', e => {
    state.sort = e.target.value; state.page = 1; renderGrid(true);
  });

  // load more
  $('#loadMoreBtn') && $('#loadMoreBtn').addEventListener('click', () => { state.page++; renderGrid(false); });

  // clear filters
  $('#clearFilters') && $('#clearFilters').addEventListener('click', () => {
    state.category='All'; state.query=''; state.page=1; $('#searchInput').value='';
    setActiveChip('All'); renderGrid(true);
  });

  // delegate: categories, chips, products
  document.addEventListener('click', e => {
    const catCard = e.target.closest('.cat-card');
    if (catCard){ selectCategory(catCard.dataset.cat); return; }

    const chip = e.target.closest('.chip');
    if (chip){ selectCategory(chip.dataset.cat, true); return; }

    const offer = e.target.closest('.js-offer');
    if (offer){ selectCategory(offer.dataset.cat); return; }

    const fLink = e.target.closest('[data-cat-link]');
    if (fLink){ e.preventDefault(); selectCategory(fLink.dataset.catLink); return; }

    const add = e.target.closest('[data-add]');
    if (add){ e.preventDefault(); addToCart(Number(add.dataset.add)); return; }

    const wa = e.target.closest('[data-wa]');
    if (wa){ e.preventDefault(); const p = byId(Number(wa.dataset.wa)); if(p){ addToCart(p.id); closeCart(); window.open(waLink(productMessage(p)), '_blank'); } return; }

    const fav = e.target.closest('[data-fav]');
    if (fav){ e.preventDefault(); toggleFav(Number(fav.dataset.fav), fav); return; }

    const quick = e.target.closest('[data-quick]');
    if (quick){ openModal(Number(quick.dataset.quick)); return; }

    const inc = e.target.closest('[data-inc]');
    if (inc){ const c = cart.find(x => x.id === Number(inc.dataset.inc) && (x.variant||'') === (inc.dataset.variant||'')); if(c) setQty(c.id, c.variant, c.qty+1); return; }

    const dec = e.target.closest('[data-dec]');
    if (dec){ const c = cart.find(x => x.id === Number(dec.dataset.dec) && (x.variant||'') === (dec.dataset.variant||'')); if(c) setQty(c.id, c.variant, c.qty-1); return; }

    const rm = e.target.closest('[data-rm]');
    if (rm){ removeItem(Number(rm.dataset.rm), rm.dataset.variant || ''); return; }

    if (e.target.closest('[data-close]')){ closeModal(); return; }
  });

  // enquiry form -> whatsapp
  $('#enquiryForm') && $('#enquiryForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#enqName').value.trim() || 'a customer';
    const msg = $('#enqMsg').value.trim() || 'I would like to enquire about your gifts.';
    window.open(waLink(`Hello Little Luxe Gifts! 🎁\n\nMy name is ${name}.\n${msg}`), '_blank');
  });

  // ESC closes overlays
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ closeModal(); closeCart(); if(so) so.hidden = true; }
  });

  loadCatalogue();
});

/* ---------- Category selection ---------- */
function setActiveChip(cat){
  $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
}
function selectCategory(cat, fromChip){
  state.category = cat; state.page = 1;
  if(!fromChip) setActiveChip(cat); else setActiveChip(cat);
  renderGrid(true);
  document.getElementById('shop').scrollIntoView({ behavior:'smooth' });
}

// expose for debugging
window.LLG = { get products(){ return ALL_PRODUCTS; }, get cart(){ return cart; } };
