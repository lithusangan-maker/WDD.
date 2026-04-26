  const AUTH_KEY = 'vv_auth';
  const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';
  const WISHLIST_KEY = 'vv_wishlist_by_user';
  const auth = (() => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; } })();
  const canUseWishlist = !auth || !auth.username || (auth.role === 'customer' && auth.username);
  const requestedId = new URLSearchParams(location.search).get('id');
  const allProducts = VV.getAllProducts();
  const p = requestedId ? VV.getProductById(requestedId) : (allProducts[0] || null);

  if (!p) {
    const container = document.querySelector('main.container');
    if (container) {
      container.innerHTML = `
        <h1 class="title">Product Not Available</h1>
        <p class="muted">This product was removed and is no longer visible to customers.</p>
        <a class="btn" href="shop.html">Back to Shop</a>
      `;
    }
  } else {
    const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
    document.getElementById('crumb').textContent = `Shop / ${brand} / ${p.name}`;
    const brandName = document.getElementById('brandName');
    if (brandName) brandName.textContent = brand;
    document.getElementById('name').textContent = p.name;
    document.getElementById('description').textContent = p.description;
    document.getElementById('price').textContent = VV.money(p.price);

    const mainImage = document.getElementById('mainImage');
    const thumbs = document.getElementById('thumbs');
    const images = p.images && p.images.length ? p.images : [p.image];
    mainImage.src = images[0];
    mainImage.onerror = () => { mainImage.src = '../assets/images/product-fallback.svg'; };

    images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = p.name;
      img.onerror = () => { img.src = '../assets/images/product-fallback.svg'; };
      img.onclick = () => mainImage.src = src;
      thumbs.appendChild(img);
    });

    const sizeSelect = document.getElementById('sizeSelect');
    (p.sizes || ['M']).forEach(s => sizeSelect.insertAdjacentHTML('beforeend', `<option>${s}</option>`));
    const colorSelect = document.getElementById('colorSelect');
    (p.colors || ['Default']).forEach(c => colorSelect.insertAdjacentHTML('beforeend', `<option>${c}</option>`));

    let qty = 1;
    const qtySpan = document.getElementById('qty');
    document.getElementById('minus').onclick = () => { qty = Math.max(1, qty - 1); qtySpan.textContent = qty; };
    document.getElementById('plus').onclick = () => { qty += 1; qtySpan.textContent = qty; };

    document.getElementById('addBtn').onclick = () => {
      VV.addToCart(p.id, qty, sizeSelect.value, colorSelect.value);
      location.href = 'cart.html';
    };

    const wishBtn = document.getElementById('wishBtn');
    function syncWishlistBtn() {
      if (!wishBtn) return;
      const wished = VV.isWishlisted(p.id);
      wishBtn.innerHTML = wished ? '&#10084;' : '&#9825;';
      wishBtn.classList.toggle('active', wished);
      wishBtn.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Add to wishlist');
    }
    if (canUseWishlist && wishBtn) {
      wishBtn.style.display = 'inline-flex';
      syncWishlistBtn();
      wishBtn.onclick = () => {
        VV.toggleWishlist(p.id);
        syncWishlistBtn();
      };
    }

    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === WISHLIST_KEY) {
        if (canUseWishlist) syncWishlistBtn();
        return;
      }
      if (e.key !== ADMIN_PRODUCTS_KEY && e.key !== REMOVED_BASE_KEY) return;
      if (!VV.getProductById(p.id)) {
        location.href = 'shop.html';
      }
    });
  }

