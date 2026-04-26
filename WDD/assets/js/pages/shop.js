    const AUTH_KEY = 'vv_auth';
    const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
    const REMOVED_BASE_KEY = 'vv_removed_base_products';
    const WISHLIST_KEY = 'vv_wishlist_by_user';
    const auth = (() => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; } })();
    const canUseWishlist = !auth || !auth.username || (auth.role === 'customer' && auth.username);
    const grid = document.getElementById('productsGrid');
    const genderFilter = document.getElementById('genderFilter');
    const typeFilter = document.getElementById('typeFilter');
    const sizeFilter = document.getElementById('sizeFilter');
    const sortBy = document.getElementById('sortBy');
    const resultCount = document.getElementById('resultCount');
    const collectionTitle = document.getElementById('collectionTitle');
    const quickFilterButtons = document.querySelectorAll('#quickFilters .chip');
    const collectionCards = document.querySelectorAll('.collection-card');
    const selectAllVisible = document.getElementById('selectAllVisible');
    const clearSelected = document.getElementById('clearSelected');
    const addSelectedBtn = document.getElementById('addSelectedBtn');
    const toast = document.getElementById('toast');
    let toastTimer = null;
    const pinnedTamilIds = [
      'tamil-korvai-bottle-green-silk-saree',
      'tamil-blue-checks-korvai-saree',
      'tamil-purple-butta-kanchipuram-saree',
      'tamil-pattu-pavadai-dhavani-set',
      'tamil-cream-dhoti-angavastram-set'
    ];
    const pinnedTamilIndex = new Map(pinnedTamilIds.map((id, idx) => [id, idx]));

    let allProducts = VV.getAllProducts();

    const params = new URLSearchParams(location.search);
    if (params.get('gender')) genderFilter.value = params.get('gender');
    if (params.get('type')) typeFilter.value = params.get('type');
    if (params.get('size')) sizeFilter.value = params.get('size');
    if (params.get('sort')) sortBy.value = params.get('sort');

    function updateFilterOptions() {
      const dynamicTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))].sort();
      const dynamicSizes = [...new Set(allProducts.flatMap(p => p.sizes || []))];
      typeFilter.innerHTML = '<option value="">All Clothing Type</option>' + dynamicTypes.map(type => `<option>${type}</option>`).join('');
      sizeFilter.innerHTML = '<option value="">All Size</option>' + dynamicSizes.map(size => `<option>${size}</option>`).join('');
    }

    updateFilterOptions();
    if (params.get('type')) typeFilter.value = params.get('type');
    if (params.get('size')) sizeFilter.value = params.get('size');

    function syncUrl() {
      const q = new URLSearchParams();
      if (genderFilter.value) q.set('gender', genderFilter.value);
      if (typeFilter.value) q.set('type', typeFilter.value);
      if (sizeFilter.value) q.set('size', sizeFilter.value);
      if (sortBy.value !== 'default') q.set('sort', sortBy.value);
      const next = q.toString() ? `?${q.toString()}` : location.pathname.split('/').pop();
      history.replaceState(null, '', next);
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1700);
    }

    function updateCollectionHeading(count) {
      collectionTitle.textContent = genderFilter.value ? `${genderFilter.value} Collection` : 'All Collections';
      resultCount.textContent = `${count} product(s) found`;
      quickFilterButtons.forEach(btn => {
        const isActive = btn.dataset.gender === genderFilter.value;
        const fallbackAll = !genderFilter.value && !btn.dataset.gender;
        btn.classList.toggle('active', isActive || fallbackAll);
      });
    }

    function sortFeatured(list) {
      return list
        .map((product, index) => ({ product, index }))
        .sort((a, b) => {
          const aId = String((a.product && a.product.id) || '');
          const bId = String((b.product && b.product.id) || '');
          const aPinned = pinnedTamilIndex.has(aId);
          const bPinned = pinnedTamilIndex.has(bId);

          if (aPinned && bPinned) return pinnedTamilIndex.get(aId) - pinnedTamilIndex.get(bId);
          if (aPinned) return -1;
          if (bPinned) return 1;

          const aTamil = aId.startsWith('tamil-');
          const bTamil = bId.startsWith('tamil-');
          if (aTamil !== bTamil) return aTamil ? -1 : 1;

          return a.index - b.index;
        })
        .map(item => item.product);
    }

    function renderProducts() {
      let list = allProducts.slice();
      if (genderFilter.value) list = list.filter(p => p.gender === genderFilter.value);
      if (typeFilter.value) list = list.filter(p => p.type === typeFilter.value);
      if (sizeFilter.value) list = list.filter(p => (p.sizes || []).includes(sizeFilter.value));
      if (sortBy.value === 'default') list = sortFeatured(list);
      if (sortBy.value === 'low') list.sort((a,b)=>a.price-b.price);
      if (sortBy.value === 'high') list.sort((a,b)=>b.price-a.price);

      grid.innerHTML = '';
      updateCollectionHeading(list.length);
      syncUrl();

      if (!list.length) {
        grid.innerHTML = '<p class="muted">No products match your filters.</p>';
        return;
      }

      list.forEach(p => {
        const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
        const wished = VV.isWishlisted(p.id);
        const wishBtn = canUseWishlist
          ? `<button class="btn-outline wish-btn ${wished ? 'active' : ''}" type="button" data-wish="${p.id}" aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}">${wished ? '&#10084;' : '&#9825;'}</button>`
          : '';
        grid.insertAdjacentHTML('beforeend', `
          <article class="product-card card">
            <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='../assets/images/product-fallback.svg';"></a>
            <div class="muted">${brand}</div>
            <div class="product-name">${p.name}</div>
            <div class="price">${VV.money(p.price)}</div>
            <label class="select-inline"><input type="checkbox" data-pick="${p.id}"> Select</label>
            <div class="actions">
              <a class="btn-outline" href="product.html?id=${p.id}">View</a>
              ${wishBtn}
              <div class="card-actions">
                <button class="btn" data-add="${p.id}">Add</button>
                <input class="input qty-input" type="number" min="1" value="1" data-qty="${p.id}">
              </div>
            </div>
          </article>
        `);
      });

      grid.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
          const qtyInput = btn.closest('article').querySelector('[data-qty]');
          const qty = Math.max(1, Number((qtyInput && qtyInput.value) || 1));
          VV.addToCart(btn.dataset.add, qty);
          showToast('Product added to cart.');
        });
      });

      if (canUseWishlist) {
        grid.querySelectorAll('[data-wish]').forEach(btn => {
          btn.addEventListener('click', () => {
            const active = VV.toggleWishlist(btn.dataset.wish);
            btn.innerHTML = active ? '&#10084;' : '&#9825;';
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
            showToast(active ? 'Added to wishlist.' : 'Removed from wishlist.');
          });
        });
      }

      selectAllVisible.checked = false;
      grid.querySelectorAll('[data-pick]').forEach(cb => cb.addEventListener('change', () => {
        const all = grid.querySelectorAll('[data-pick]');
        const checked = grid.querySelectorAll('[data-pick]:checked');
        selectAllVisible.checked = all.length > 0 && all.length === checked.length;
      }));
    }

    sortBy.addEventListener('change', renderProducts);
    genderFilter.addEventListener('change', renderProducts);
    [typeFilter, sizeFilter].forEach(el => el.addEventListener('change', renderProducts));
    quickFilterButtons.forEach(btn => btn.addEventListener('click', () => {
      genderFilter.value = btn.dataset.gender;
      renderProducts();
    }));
    collectionCards.forEach(card => card.addEventListener('click', () => {
      genderFilter.value = card.dataset.gender;
      renderProducts();
    }));
    selectAllVisible.addEventListener('change', () => grid.querySelectorAll('[data-pick]').forEach(cb => cb.checked = selectAllVisible.checked));
    clearSelected.addEventListener('click', () => { selectAllVisible.checked = false; grid.querySelectorAll('[data-pick]').forEach(cb => cb.checked = false); });
    addSelectedBtn.addEventListener('click', () => {
      const selected = [...grid.querySelectorAll('[data-pick]:checked')];
      if (!selected.length) return showToast('Please select at least one product.');
      selected.forEach(cb => {
        const id = cb.dataset.pick;
        const qtyInput = cb.closest('article').querySelector('[data-qty]');
        const qty = Math.max(1, Number((qtyInput && qtyInput.value) || 1));
        VV.addToCart(id, qty);
      });
      showToast(`${selected.length} product(s) added to cart.`);
      selectAllVisible.checked = false;
      grid.querySelectorAll('[data-pick]').forEach(cb => cb.checked = false);
    });

    renderProducts();

    window.addEventListener('storage', (e) => {
      if (e.key !== ADMIN_PRODUCTS_KEY && e.key !== REMOVED_BASE_KEY && e.key !== WISHLIST_KEY) return;
      const prevType = typeFilter.value;
      const prevSize = sizeFilter.value;
      const prevGender = genderFilter.value;
      const prevSort = sortBy.value;

      allProducts = VV.getAllProducts();
      updateFilterOptions();

      genderFilter.value = prevGender;
      if ([...typeFilter.options].some(opt => opt.value === prevType)) typeFilter.value = prevType;
      else typeFilter.value = '';
      if ([...sizeFilter.options].some(opt => opt.value === prevSize)) sizeFilter.value = prevSize;
      else sizeFilter.value = '';
      sortBy.value = prevSort;

      renderProducts();
      showToast('Products updated by Product Manager.');
    });
  

