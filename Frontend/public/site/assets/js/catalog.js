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

  const state = {
    cats: new Set(),
    brands: new Set(),
    maxPrice: 15000,
    stockOnly: false,
    q: '',
    sort: 'featured',
  };

  // Build category checkboxes (multi-select; empty = All)
  catFilters.innerHTML = DDD.categories.map(c => {
    const n = DDD.byCategory(c.id).length;
    return `<label class="f-check"><input type="checkbox" value="${c.id}" data-fcat> ${c.name}<span class="cnt">${n}</span></label>`;
  }).join('');

  // Brand list present in catalog
  const catalogBrands = [...new Set(DDD.products.map(p => p.brand))];
  brandFilters.innerHTML = catalogBrands.map(b => {
    const n = DDD.products.filter(p => p.brand === b).length;
    return `<label class="f-check"><input type="checkbox" value="${b}" data-fbrand> ${b}<span class="cnt">${n}</span></label>`;
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
      bindCardWaLinks();
      if (hl) {
        const el = grid.querySelector(`[data-add="${hl}"]`);
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
    state.cats.clear(); state.brands.clear(); state.maxPrice = 15000; state.stockOnly = false; state.q = '';
    searchInput.value = ''; syncFilterUI(); apply();
  });

  // Mobile filters
  const mf = document.getElementById('mobileFilters');
  const body = document.getElementById('mobileFilterBody');
  document.getElementById('filterOpen').addEventListener('click', () => { body.innerHTML = ''; body.append(catFilters.cloneNode(true), brandFilters.cloneNode(true), priceRange.closest('.f-group').cloneNode(true), stockOnly.closest('.f-group').cloneNode(true)); mf.classList.add('open'); document.body.style.overflow = 'hidden'; });
  const closeMF = () => { mf.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('filterClose').addEventListener('click', closeMF);
  document.getElementById('filterApply').addEventListener('click', () => {
    const mCats = [...body.querySelectorAll('[data-fcat]')], mBrands = [...body.querySelectorAll('[data-fbrand]')];
    state.cats = new Set(mCats.filter(c => c.checked).map(c => c.value));
    state.brands = new Set(mBrands.filter(c => c.checked).map(c => c.value));
    const r = body.querySelector('.price-slider'); if (r) state.maxPrice = +r.value;
    const s = body.querySelector('#stockOnly'); if (s) state.stockOnly = s.checked;
    syncFilterUI(); apply(); closeMF();
  });
  mf.addEventListener('click', e => { if (e.target === mf) closeMF(); });

  syncFilterUI();
  apply();
})();
