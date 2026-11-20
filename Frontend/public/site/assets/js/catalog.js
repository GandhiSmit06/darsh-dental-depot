/* ============================================================
   DARSH DENTAL DEPOT — Catalog page logic
   ============================================================ */
(function () {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const resultCount = document.getElementById('resultCount');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const priceRange = document.getElementById('priceRange');
  const priceOut = document.getElementById('priceOut');
  const stockOnly = document.getElementById('stockOnly');
  const catFilters = document.getElementById('catFilters');
  const brandFilters = document.getElementById('brandFilters');
  const priceLimit = DDD.products.reduce((max, p) => Math.max(max, p.price), 15000);
  priceRange.max = Math.ceil(priceLimit / 50) * 50;
  priceRange.min = 0;

  const state = {
    cats: new Set(),
    brands: new Set(),
    maxPrice: Number(priceRange.max),
    stockOnly: false,
    q: '',
    sort: 'featured',
  };

  if (!DDD.products.length) {
    const message = DDD.catalogAvailable ? 'No products are listed yet.' : 'The catalog is temporarily unavailable.';
    resultCount.textContent = message;
    emptyState.querySelector('h3').textContent = message;
    emptyState.querySelector('p').textContent = 'Contact the depot for stock and pricing.';
    emptyState.style.display = '';
    document.querySelector('.filters').hidden = true;
    document.getElementById('filterOpen').hidden = true;
    searchInput.disabled = sortSelect.disabled = true;
    return;
  }

  // Build category checkboxes (multi-select; empty = All)
  catFilters.innerHTML = DDD.categories.map(c => {
    const n = DDD.byCategory(c.id).length;
    return `<label class="f-check"><input type="checkbox" value="${escapeCardText(c.id)}" data-fcat> ${escapeCardText(c.name)}<span class="cnt">${n}</span></label>`;
  }).join('');

  // Brand list present in catalog
  const catalogBrands = [...new Set(DDD.products.map(p => p.brand))];
  brandFilters.innerHTML = catalogBrands.map(b => {
    const n = DDD.products.filter(p => p.brand === b).length;
    return `<label class="f-check"><input type="checkbox" value="${escapeCardText(b)}" data-fbrand> ${escapeCardText(b)}<span class="cnt">${n}</span></label>`;
  }).join('');

  // URL params (?cat=restorative, ?highlight=filtek, ?q=...)
  const params = new URLSearchParams(location.search);
  if (params.get('cat') && DDD.categories.some(c => c.id === params.get('cat'))) {
    state.cats.add(params.get('cat'));
  }
  const hl = params.get('highlight');
  if (params.get('q')) searchInput.value = params.get('q'), state.q = params.get('q').toLowerCase();

  // Sync checkbox UI from state
  function syncFilterUI() {
    document.querySelectorAll('[data-fcat]').forEach(cb => cb.checked = state.cats.has(cb.value));
    document.querySelectorAll('[data-fbrand]').forEach(cb => cb.checked = state.brands.has(cb.value));
    priceRange.value = state.maxPrice;
    priceOut.textContent = DDD.money(state.maxPrice);
    stockOnly.checked = state.stockOnly;
  }

  function apply() {
    let list = [...DDD.products];

    if (state.cats.size) list = list.filter(p => state.cats.has(p.cat));
    if (state.brands.size) list = list.filter(p => state.brands.has(p.brand));
    list = list.filter(p => p.price <= state.maxPrice);
    if (state.stockOnly) list = list.filter(p => p.stock !== 'out');
    if (state.q) {
      const q = state.q;
      list = list.filter(p => (p.name + ' ' + p.brand + ' ' + DDD.catName(p.cat)).toLowerCase().includes(q));
    }

    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'discount': list.sort((a, b) => DDD.off(b) - DDD.off(a)); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
    }

    // Highlight (deep-link from home category cards etc.)
    if (hl) {
      const i = list.findIndex(p => p.id === hl);
      if (i > 0) { const [p] = list.splice(i, 1); list.unshift(p); }
    }

    resultCount.innerHTML = `Showing <b>${list.length}</b> of ${DDD.products.length} depot products`;
    if (!list.length) {
      grid.innerHTML = '';
      emptyState.style.display = '';
    } else {
      emptyState.style.display = 'none';
      grid.innerHTML = list.map(p => productCard(p)).join('');
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      if (hl) {
        const el = grid.querySelector(`[data-add="${CSS.escape(hl)}"]`);
        if (el) setTimeout(() => el.closest('.p-card').scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
    }
  }

  // Events
  catFilters.addEventListener('change', e => {
    const cb = e.target; if (!cb.matches('[data-fcat]')) return;
    cb.checked ? state.cats.add(cb.value) : state.cats.delete(cb.value);
    apply();
  });
  brandFilters.addEventListener('change', e => {
    const cb = e.target; if (!cb.matches('[data-fbrand]')) return;
    cb.checked ? state.brands.add(cb.value) : state.brands.delete(cb.value);
    apply();
  });
  priceRange.addEventListener('input', () => { state.maxPrice = +priceRange.value; priceOut.textContent = DDD.money(state.maxPrice); apply(); });
  stockOnly.addEventListener('change', () => { state.stockOnly = stockOnly.checked; apply(); });
  searchInput.addEventListener('input', () => { state.q = searchInput.value.toLowerCase().trim(); apply(); });
  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; apply(); });
  document.getElementById('clearFilters').addEventListener('click', () => {
    state.cats.clear(); state.brands.clear(); state.maxPrice = Number(priceRange.max); state.stockOnly = false; state.q = '';
    searchInput.value = ''; syncFilterUI(); apply();
  });

  // Mobile filters
  const mf = document.getElementById('mobileFilters');
  const body = document.getElementById('mobileFilterBody');
  const sidebar = document.querySelector('.filters');
  const trigger = document.getElementById('filterOpen');
  const close = document.getElementById('filterClose');
  function closeFilters() {
    if (!mf.classList.contains('open')) return;
    sidebar.append(...body.children);
    mf.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    trigger.focus();
  }
  trigger.addEventListener('click', () => {
    body.append(...sidebar.children);
    mf.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus();
  });
  close.addEventListener('click', closeFilters);
  document.getElementById('filterApply').addEventListener('click', closeFilters);
  mf.addEventListener('click', e => { if (e.target === mf) closeFilters(); });
  mf.addEventListener('keydown', e => { if (e.key === 'Escape') closeFilters(); });
  matchMedia('(max-width:1020px)').addEventListener('change', e => { if (!e.matches) closeFilters(); });

  syncFilterUI();
  apply();
})();
