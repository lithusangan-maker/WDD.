    const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
    const REMOVED_BASE_KEY = 'vv_removed_base_products';
    let allProducts = VV.getAllProducts();
    let currentMode = 'products';
    const featuredGrid = document.getElementById('featuredGrid');
    const tabContent = document.getElementById('tabContent');
    const tabs = document.querySelectorAll('#homeTabs .tab');

    function productCard(p) {
      const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
      return `
        <article class="card product-card">
          <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='../assets/images/product-fallback.svg';"></a>
          <div class="muted">${brand}</div>
          <div class="product-name">${p.name}</div>
          <div class="price">${VV.money(p.price)}</div>
          <a class="btn-outline" href="product.html?id=${p.id}">View Product</a>
        </article>
      `;
    }

    function renderProductsTab() {
      tabContent.innerHTML = `
        <div class="grid-4">
          <a class="card product-card" href="shop.html?gender=Women"><img src="https://images.unsplash.com/photo-1704775989614-8435994e4e97" alt="Women Modern"><div class="muted">${VV.DEFAULT_BRAND || 'Velvet Vogue'}</div><div class="product-name">Women Modern Edit</div><span class="badge">Modern Picks</span></a>
          <a class="card product-card" href="shop.html?gender=Men"><img src="https://images.unsplash.com/photo-1598033067000-6a57d614b183" alt="Men Modern"><div class="muted">${VV.DEFAULT_BRAND || 'Velvet Vogue'}</div><div class="product-name">Men Modern Edit</div><span class="badge">Modern Picks</span></a>
          <a class="card product-card" href="shop.html?gender=Unisex"><img src="https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=900&q=80" alt="Unisex"><div class="muted">${VV.DEFAULT_BRAND || 'Velvet Vogue'}</div><div class="product-name">Unisex Collection</div><span class="badge">Daily Wear</span></a>
          <a class="card product-card" href="shop.html?sort=low"><img src="https://images.unsplash.com/photo-1616469987545-6a037d893e72" alt="Trending Looks"><div class="muted">${VV.DEFAULT_BRAND || 'Velvet Vogue'}</div><div class="product-name">Trending Looks</div><span class="badge">Price Drop</span></a>
        </div>
      `;
    }

    function renderPromotionsTab() {
      tabContent.innerHTML = `
        <div class="offer-grid">
          <article class="card offer"><h3>Buy 2 Get 1</h3><p class="muted">Add any 3 tops to cart and get the lowest-priced item free.</p><a class="btn" href="shop.html?type=Top">Shop Tops</a></article>
          <article class="card offer"><h3>Weekend 25% Off</h3><p class="muted">Flat 25% off on selected jackets and blazers until Sunday night.</p><a class="btn" href="shop.html?type=Jacket">Shop Jackets</a></article>
          <article class="card offer"><h3>Free Shipping</h3><p class="muted">Enjoy free shipping for orders above LKR 100 across all categories.</p><a class="btn" href="shop.html">Shop Now</a></article>
        </div>
      `;
    }

    function renderArrivalsTab() {
      const arrivals = allProducts.slice(-8).reverse();
      tabContent.innerHTML = `<div class="arrival-grid">${arrivals.map(productCard).join('')}</div>`;
    }

    function renderTab(mode) {
      currentMode = mode;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
      if (mode === 'products') renderProductsTab();
      if (mode === 'promotions') renderPromotionsTab();
      if (mode === 'arrivals') renderArrivalsTab();
    }

    tabs.forEach(tab => tab.addEventListener('click', () => renderTab(tab.dataset.mode)));
    function renderFeatured() {
      featuredGrid.innerHTML = '';
      allProducts.slice(0, 12).forEach(p => featuredGrid.insertAdjacentHTML('beforeend', productCard(p)));
    }

    renderFeatured();
    renderTab('products');

    window.addEventListener('storage', (e) => {
      if (e.key !== ADMIN_PRODUCTS_KEY && e.key !== REMOVED_BASE_KEY) return;
      allProducts = VV.getAllProducts();
      renderFeatured();
      renderTab(currentMode);
    });
  

