  const AUTH_KEY = 'vv_auth';
  const WISHLIST_KEY = 'vv_wishlist_by_user';
  const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';

  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; }
  }

  const auth = loadAuth();
  const isGuest = !auth || !auth.username;
  if (auth && auth.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (auth && auth.role === 'productManager') {
    window.location.href = 'pm-dashboard.html';
  }

  const rows = document.getElementById('rows');
  const wishCount = document.getElementById('wishCount');
  const wishValue = document.getElementById('wishValue');
  const wishStatus = document.getElementById('wishStatus');
  const clearWish = document.getElementById('clearWish');

  function render() {
    const ids = VV.getWishlist();
    const validIds = ids.filter(id => !!VV.getProductById(id));
    if (validIds.length !== ids.length) {
      VV.saveWishlist(validIds);
    }

    rows.innerHTML = '';
    let total = 0;

    if (!validIds.length) {
      rows.innerHTML = `<div style="padding:14px" class="muted">${isGuest ? 'Guest wishlist is empty.' : 'Wishlist is empty.'} <a href="shop.html">Find products</a>.</div>`;
      wishCount.textContent = '0';
      wishValue.textContent = VV.money(0);
      wishStatus.textContent = 'Empty';
      return;
    }

    validIds.forEach(id => {
      const p = VV.getProductById(id);
      if (!p) return;
      const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
      total += Number(p.price || 0);
      rows.insertAdjacentHTML('beforeend', `
        <div class="table-row">
          <div class="product-cell">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='../assets/images/product-fallback.svg';">
            <div>
              <div class="muted">${brand}</div>
              <div class="product-name">${p.name}</div>
              <div class="muted">${p.type || '-'} - ${p.gender || '-'}</div>
              <div class="item-actions">
                <a class="btn-outline" href="product.html?id=${p.id}">View</a>
                <button class="btn" type="button" data-cart="${p.id}">Add to Cart</button>
                <button class="btn-outline" type="button" data-remove="${p.id}">Remove</button>
              </div>
            </div>
          </div>
          <div>${VV.money(p.price || 0)}</div>
          <div><span class="badge">Saved</span></div>
          <div><a class="btn-outline" href="checkout.html">Buy Now</a></div>
        </div>
      `);
    });

    rows.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        VV.removeFromWishlist(btn.dataset.remove);
        render();
      });
    });

    rows.querySelectorAll('[data-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        VV.addToCart(btn.dataset.cart, 1);
        window.location.href = 'cart.html';
      });
    });

    wishCount.textContent = String(validIds.length);
    wishValue.textContent = VV.money(total);
    wishStatus.textContent = 'Ready';
  }

  clearWish.addEventListener('click', () => {
    VV.clearWishlist();
    render();
  });

  render();

  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === WISHLIST_KEY || e.key === ADMIN_PRODUCTS_KEY || e.key === REMOVED_BASE_KEY) {
      render();
    }
  });

