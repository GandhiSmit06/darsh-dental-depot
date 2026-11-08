/* ============================================================
   DARSH DENTAL DEPOT — UI chrome, cart, interactions
   ============================================================ */

const ICONS = {
  logoMark: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ddT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F4348"/><stop offset=".55" stop-color="#16332F"/><stop offset="1" stop-color="#0E1F21"/></linearGradient><linearGradient id="ddSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="ddTh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FEFEFC"/><stop offset=".5" stop-color="#EFF4F2"/><stop offset="1" stop-color="#BFDBDA"/></linearGradient><linearGradient id="ddSp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4F0EF"/><stop offset="1" stop-color="#AFCCCD"/></linearGradient><clipPath id="ddCp"><rect x="2" y="2" width="60" height="60" rx="17"/></clipPath></defs><rect x="2" y="2" width="60" height="60" rx="17" fill="url(#ddT)"/><rect x="2" y="2" width="60" height="34" clip-path="url(#ddCp)" fill="url(#ddSh)"/><rect x="2.75" y="2.75" width="58.5" height="58.5" rx="16.25" fill="none" stroke="#AFCCCD" stroke-opacity=".38" stroke-width="1.5"/><path d="M25.2 13.9c-8.6 0-14.1 5.5-14.1 12.8 0 5.5 2.1 8.8 3.4 13 .8 3.4 1.5 13.7 4.8 13.7 3.8 0 2.3-9.7 5.9-9.7s2.1 9.7 5.9 9.7c3.4 0 4-10.3 4.8-13.7 1.3-4.2 3.4-7.5 3.4-13 0-7.4-5.5-12.8-14.1-12.8z" fill="url(#ddTh)" stroke="#9DBEC0" stroke-opacity=".28"/><path d="M47 9.5 Q48.3 15.7 54.5 17 Q48.3 18.3 47 24.5 Q45.7 18.3 39.5 17 Q45.7 15.7 47 9.5 Z" fill="url(#ddSp)"/><path d="M54 25.2 Q54.6 28 57.4 28.6 Q54.6 29.2 54 32 Q53.4 29.2 50.6 28.6 Q53.4 28 54 25.2 Z" fill="#AFCCCD" opacity=".85"/></svg>',
  tooth: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6c-4.1 0-6.7 2.6-6.7 6.1 0 2.6 1 4.2 1.6 6.2.4 1.6.7 6.5 2.3 6.5 1.8 0 1.1-4.6 2.8-4.6s1 4.6 2.8 4.6c1.6 0 1.9-4.9 2.3-6.5.6-2 1.6-3.6 1.6-6.2 0-3.5-2.6-6.1-6.7-6.1z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
};

/* ---------- Chrome templates ---------- */
function navLink(href, label, key) {
  return `<a href="${href}" data-nav="${key}">${label}</a>`;
}

function buildHeader() {
  const page = document.body.dataset.page || '';
  const links = [
    navLink('/', 'Home', 'home'),
    navLink('/products', 'Products', 'products'),
    navLink('/brands', 'Brands', 'brands'),
    navLink('/about', 'About', 'about'),
    navLink('/location', 'Location', 'location'),
    navLink('/contact', 'Contact', 'contact'),
  ];
  return `
  <div class="announce">
    <div class="container-wide">
      <span class="a-item">${ICONS.truck}<span>2-Hour Clinic Delivery across Vadodara</span></span>
      <span class="a-item hide-m">${ICONS.clock}<span>${DDD.hours} · Sunday: Emergency on-call</span></span>
      <div class="a-right">
        <a class="a-item" href="tel:+${DDD.phoneRaw}">${ICONS.phone}<span>${DDD.phone}</span></a>
        <a class="a-item" href="${DDD.wa('Hello Darsh Dental Depot! I need help with an order.')}" target="_blank" rel="noopener">${ICONS.wa}<span>WhatsApp</span></a>
      </div>
    </div>
  </div>
  <header class="site-header" id="siteHeader">
    <div class="container-wide">
      <a class="brand" href="/" aria-label="Darsh Dental Depot home">
        <span class="mark">${ICONS.logoMark}</span>
        <span><span class="b-name">Darsh</span><span class="b-sub" style="display:block">Dental Depot · Vadodara</span></span>
      </a>
      <nav class="main-nav" aria-label="Primary">${links.join('')}</nav>
      <div class="header-actions">
        <button class="icon-btn" id="cartBtn" aria-label="Open order list">${ICONS.bag}<span class="badge" id="cartBadge">0</span></button>
        <a class="icon-btn hide-m" href="/login" aria-label="Doctor portal sign in" title="Doctor Portal Sign In">${ICONS.user}</a>
        <a class="btn btn-sm" href="/register">Register Clinic</a>
        <button class="icon-btn hamburger" id="menuBtn" aria-label="Open menu">${ICONS.menu}</button>
      </div>
    </div>
  </header>
  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <div class="mm-top">
      <a class="brand" href="/"><span class="mark">${ICONS.logoMark}</span><span><span class="b-name">Darsh</span><span class="b-sub" style="display:block">Dental Depot</span></span></a>
      <button class="icon-btn" id="menuClose" aria-label="Close menu">${ICONS.x}</button>
    </div>
    <nav aria-label="Mobile">
      <a href="/">Home ${ICONS.arrow}</a>
      <a href="/products">Products ${ICONS.arrow}</a>
      <a href="/brands">Brands ${ICONS.arrow}</a>
      <a href="/about">About ${ICONS.arrow}</a>
      <a href="/location">Location ${ICONS.arrow}</a>
      <a href="/contact">Contact ${ICONS.arrow}</a>
      <a href="/doctor">Doctor Portal ${ICONS.arrow}</a>
    </nav>
    <div class="mm-foot">
      <a class="btn btn-wa" href="${DDD.wa('Hello Darsh Dental Depot! I would like to place an order.')}" target="_blank" rel="noopener">${ICONS.wa} Order on WhatsApp</a>
      <a class="btn btn-outline" href="/login">${ICONS.user} Doctor Portal Sign In</a>
    </div>
  </div>`;
}

function buildFooter() {
  return `
  <footer class="site-footer">
    <div class="watermark" aria-hidden="true">DARSH</div>
    <div class="container-wide">
      <div class="footer-cta">
        <div class="fc-title">Need a material urgently? We answer in minutes.</div>
        <div class="fc-actions">
          <a class="btn btn-wa" href="${DDD.wa('Hello Darsh Dental Depot! I need a material urgently.')}" target="_blank" rel="noopener">${ICONS.wa} WhatsApp the Depot</a>
          <a class="btn btn-light" href="tel:+${DDD.phoneRaw}">${ICONS.phone} ${DDD.phone}</a>
        </div>
      </div>
      <div class="footer-grid">
        <div class="f-brand">
          <div class="b-row">
            <span class="mark">${ICONS.logoMark}</span>
            <span><span class="b-name">Darsh Dental Depot</span><span class="b-sub" style="display:block">Genuine · Local · Since 2014</span></span>
          </div>
          <p>Vadodara's dedicated dental supply depot — 100% genuine materials, instruments and disposables from authorised distributors, delivered to your clinic within 2 hours.</p>
        </div>
        <div>
          <h4>Catalog</h4>
          <ul class="f-links">
            <li><a href="/products">All Products</a></li>
            <li><a href="/products?cat=restorative">Composite &amp; Restorative</a></li>
            <li><a href="/products?cat=endo">Endodontics</a></li>
            <li><a href="/products?cat=impression">Impression Materials</a></li>
            <li><a href="/products?cat=sterile">Sterilization &amp; Disposables</a></li>
          </ul>
        </div>
        <div>
          <h4>Depot</h4>
          <ul class="f-links">
            <li><a href="/about">About the Depot</a></li>
            <li><a href="/brands">Authorised Brands</a></li>
            <li><a href="/location">Location &amp; Delivery</a></li>
            <li><a href="/contact">Contact &amp; Enquiry</a></li>
            <li><a href="/register">Register Your Clinic</a></li>
          </ul>
        </div>
        <div>
          <h4>Visit / Contact</h4>
          <ul class="f-contact" style="list-style:none;margin:0;padding:0">
            <li>${ICONS.pin}<span>${DDD.address}</span></li>
            <li>${ICONS.clock}<span>${DDD.hours}<br>Sunday: Emergency on-call</span></li>
            <li>${ICONS.phone}<span><a href="tel:+${DDD.phoneRaw}">${DDD.phone}</a></span></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Darsh Dental Depot, Shiyabaug, Vadodara. All rights reserved.</span>
        <div class="fb-links">
          <a href="/login">Doctor Portal</a>
          <a href="/doctor">Dashboard</a>
          <a href="${DDD.mapsQuery ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(DDD.mapsQuery) : '#'}" target="_blank" rel="noopener">Google Maps</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Cart drawer -->
  <div class="cart-overlay" id="cartOverlay"></div>
  <aside class="cart-drawer" id="cartDrawer" aria-label="Order list" aria-hidden="true">
    <div class="cart-head">
      <h3>Your Order <span class="cnt" id="cartHeadCount">0</span></h3>
      <button class="icon-btn" id="cartClose" aria-label="Close order list">${ICONS.x}</button>
    </div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-foot" id="cartFoot">
      <div class="cart-total"><span class="t-label">Order total (incl. GST)</span><span class="t-amt" id="cartTotal">₹0</span></div>
      <span class="small">Direct depot pricing — final bill shared on WhatsApp before dispatch.</span>
      <a class="btn btn-wa" id="cartWaBtn" href="#" target="_blank" rel="noopener">${ICONS.wa} Send Order on WhatsApp</a>
      <span class="wa-note">${ICONS.wa} Order goes to +91 97270 76119 — confirmed in minutes</span>
    </div>
  </aside>

  <div class="toast-zone" id="toastZone" aria-live="polite"></div>`;
}

/* ---------- Cart state ---------- */
const Cart = {
  key: 'ddd_cart_v1',
  read() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; } },
  write(c) { localStorage.setItem(this.key, JSON.stringify(c)); renderCartBadge(); },
  add(id, qty = 1) {
    const c = this.read();
    c[id] = (c[id] || 0) + qty;
    this.write(c);
    const p = DDD.product(id);
    if (p) toast(`${p.name.split('—')[0].trim()} added to your order`, 'wa');
  },
  setQty(id, qty) {
    const c = this.read();
    if (qty <= 0) delete c[id]; else c[id] = qty;
    this.write(c); renderCart();
  },
  count() { return Object.values(this.read()).reduce((a, b) => a + b, 0); },
  total() { return Object.entries(this.read()).reduce((sum, [id, q]) => { const p = DDD.product(id); return p ? sum + p.price * q : sum; }, 0); },
};

function renderCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const n = Cart.count();
  badge.textContent = n > 99 ? '99+' : n;
  badge.classList.toggle('show', n > 0);
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footEl = document.getElementById('cartFoot');
  const headCount = document.getElementById('cartHeadCount');
  if (!itemsEl) return;
  const cart = Cart.read();
  const ids = Object.keys(cart);
  headCount.textContent = Cart.count();

  if (!ids.length) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div>
          <div class="ce-ico">${ICONS.bag}</div>
          <h4>Your order list is empty</h4>
          <p>Add materials from the catalog and send the whole list to us on WhatsApp.</p>
          <a class="btn btn-sm" href="/products">Browse the Catalog</a>
        </div>
      </div>`;
    footEl.style.display = 'none';
    return;
  }
  footEl.style.display = '';
  itemsEl.innerHTML = ids.map(id => {
    const p = DDD.product(id); if (!p) return '';
    const q = cart[id];
    return `
    <div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="ci-info">
        <span class="ci-brand">${p.brand}</span>
        <div class="ci-name">${p.name}</div>
        <div class="ci-price">${DDD.money(p.price)}</div>
      </div>
      <div class="qty-stepper" aria-label="Quantity">
        <button data-dec="${id}" aria-label="Decrease">${ICONS.minus}</button>
        <span class="q">${q}</span>
        <button data-inc="${id}" aria-label="Increase">${ICONS.plus}</button>
      </div>
      <button class="ci-remove" data-rm="${id}" aria-label="Remove ${p.name}">${ICONS.trash}</button>
    </div>`;
  }).join('');

  const total = Cart.total();
  document.getElementById('cartTotal').textContent = DDD.money(total);
  const lines = Object.entries(cart).map(([id, q]) => { const p = DDD.product(id); return `• ${q} × ${p.name} — ${DDD.money(p.price * q)}`; }).join('\n');
  const msg = `Hello Darsh Dental Depot! I would like to place an order:\n\n${lines}\n\nOrder total: ${DDD.money(total)}\n\nName: \nClinic: \nDelivery area: `;
  document.getElementById('cartWaBtn').href = DDD.wa(msg);
}

function openCart() {
  renderCart();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------- Toast ---------- */
function toast(msg, variant = '') {
  const zone = document.getElementById('toastZone');
  if (!zone) return;
  const el = document.createElement('div');
  el.className = 'toast ' + variant;
  el.innerHTML = (variant === 'wa' ? ICONS.wa : ICONS.check) + `<span>${msg}</span>`;
  zone.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2600);
}

/* ---------- Global init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Inject chrome
  const header = document.getElementById('siteChrome');
  const footer = document.getElementById('siteFooter');
  if (header) header.innerHTML = buildHeader();
  if (footer) footer.innerHTML = buildFooter();

  // Active nav
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.dataset.nav === page) a.classList.add('active');
  });

  // Header shadow on scroll
  const siteHeader = document.getElementById('siteHeader');
  if (siteHeader) {
    const onScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  const mm = document.getElementById('mobileMenu');
  const openMM = () => { mm.classList.add('open'); mm.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeMM = () => { mm.classList.remove('open'); mm.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  document.getElementById('menuBtn')?.addEventListener('click', openMM);
  document.getElementById('menuClose')?.addEventListener('click', closeMM);
  mm?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMM));

  // Cart events
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const rm = e.target.closest('[data-rm]');
    if (inc) { const c = Cart.read(); Cart.setQty(inc.dataset.inc, (c[inc.dataset.inc] || 0) + 1); }
    if (dec) { const c = Cart.read(); Cart.setQty(dec.dataset.dec, (c[dec.dataset.dec] || 0) - 1); }
    if (rm) { Cart.setQty(rm.dataset.rm, 0); toast('Removed from order list'); }
  });
  renderCartBadge();

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      const el = en.target, end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', dur = 1600, t0 = performance.now();
      const step = t => {
        const k = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = (Number.isInteger(end) ? Math.round(end * eased) : (end * eased).toFixed(1)) + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => cio.observe(el));

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
      if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  // Expose add-to-cart for rendered cards
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.dataset.add;
    const p = DDD.product(id);
    if (p && p.stock === 'out') return;
    Cart.add(id);
    btn.classList.add('added');
    const prev = btn.innerHTML;
    btn.innerHTML = ICONS.check + ' Added';
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = prev; }, 1500);
  });
});

/* ---------- Shared render helpers ---------- */
function productCard(p, { compact = false } = {}) {
  const stockLabel = { in: '<span class="pc-stock in"><span class="dot"></span>In Stock</span>', low: '<span class="pc-stock low"><span class="dot"></span>Low Stock</span>', out: '<span class="pc-stock out"><span class="dot"></span>On Order</span>' }[p.stock];
  const stars = '★★★★★'.slice(0, Math.round(p.rating));
  const out = p.stock === 'out';
  return `
  <article class="p-card reveal">
    <a class="pc-media" href="/products?highlight=${p.id}" aria-label="${p.name}">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      ${p.mrp > p.price ? `<span class="pc-off">${DDD.off(p)}% OFF</span>` : ''}
      ${stockLabel}
      <span class="pc-wa" title="Order this item on WhatsApp">${ICONS.wa}</span>
    </a>
    <div class="pc-body">
      <span class="pc-brand">${p.brand}</span>
      <h3>${p.name}</h3>
      <div class="pc-rating"><span class="stars">${stars}</span> ${p.rating} (${p.reviews})</div>
      <div class="pc-foot">
        <div class="pc-price"><span class="now">${DDD.money(p.price)}</span>${p.mrp > p.price ? `<span class="was">${DDD.money(p.mrp)}</span>` : ''}</div>
        ${compact ? '' : `<button class="add-btn" data-add="${p.id}" ${out ? 'disabled' : ''}>${out ? 'Enquire' : ICONS.plus + ' Add'}</button>`}
      </div>
    </div>
  </article>`;
}

function bindCardWaLinks() {
  document.querySelectorAll('.pc-wa').forEach(el => {
    const card = el.closest('.p-card');
    const name = card?.querySelector('h3')?.textContent || 'a product';
    el.closest('a')?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      window.open(DDD.wa(`Hello Darsh Dental Depot! I would like to order: ${name}. Is it in stock?`), '_blank');
    });
  });
}
