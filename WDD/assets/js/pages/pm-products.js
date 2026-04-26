  const AUTH_KEY = 'vv_auth';
  const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';
  const auth = (() => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; } })();
  if (!auth) {
    window.location.href = 'login.html';
  } else if (auth.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (auth.role !== 'productManager') {
    window.location.href = 'home.html';
  }

  const table = document.getElementById('productsTable');
  const msgOk = document.getElementById('msgOk');
  const msgErr = document.getElementById('msgErr');
  const form = document.getElementById('addProductForm');
  const imageInput = document.getElementById('image');
  const imageFileInput = document.getElementById('imageFile');
  const imagePreview = document.getElementById('imagePreview');
  let previewBlobUrl = '';

  function showOk(text) {
    msgErr.style.display = 'none';
    msgOk.textContent = text;
    msgOk.style.display = 'block';
  }

  function showErr(text) {
    msgOk.style.display = 'none';
    msgErr.textContent = text;
    msgErr.style.display = 'block';
  }

  function slugify(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('product-' + Date.now());
  }

  function showPreview(src) {
    if (previewBlobUrl && previewBlobUrl !== src) {
      URL.revokeObjectURL(previewBlobUrl);
      previewBlobUrl = '';
    }
    if (!src) {
      imagePreview.style.display = 'none';
      imagePreview.removeAttribute('src');
      return;
    }
    if (String(src).startsWith('blob:')) {
      previewBlobUrl = src;
    } else {
      previewBlobUrl = '';
    }
    imagePreview.src = src;
    imagePreview.style.display = 'block';
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Image file read failed.'));
      reader.readAsDataURL(file);
    });
  }

  function renderProducts() {
    const allProducts = VV.getAllProducts();
    const customIds = new Set(VV.getAdminProducts().map(p => p.id));

    table.innerHTML = `
      <div class="pm-row pm-head-row">
        <div>Name</div><div>Type</div><div>Gender</div><div>Price</div><div>Source</div><div>Action</div>
      </div>
    `;

    allProducts.forEach(p => {
      const isCustom = customIds.has(p.id);
      const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
      table.insertAdjacentHTML('beforeend', `
        <article class="pm-row">
          <div><div class="muted">${brand}</div><strong>${p.name}</strong><div class="muted">${p.id}</div></div>
          <div>${p.type || '-'}</div>
          <div>${p.gender || '-'}</div>
          <div>${VV.money(p.price || 0)}</div>
          <div><span class="chip ${isCustom ? 'custom' : 'base'}">${isCustom ? 'Manager' : 'Base'}</span></div>
          <div><button class="btn-outline" data-remove="${p.id}" type="button">Remove</button></div>
        </article>
      `);
    });

    table.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!window.VVBackend || typeof window.VVBackend.removeProduct !== 'function') {
          showErr('Backend unavailable. Please refresh and try again.');
          return;
        }
        try {
          const result = await window.VVBackend.removeProduct(btn.dataset.remove);
          if (!result || !result.ok || !result.data || !result.data.ok) {
            showErr((result && result.data && result.data.error) ? result.data.error : 'Server sync failed.');
            return;
          }
          if (typeof VV.removeProductById === 'function') {
            VV.removeProductById(btn.dataset.remove);
          } else {
            const current = VV.getAdminProducts();
            VV.saveAdminProducts(current.filter(p => p.id !== btn.dataset.remove));
          }
          if (typeof window.VVBackend.syncFromServerAsync === 'function') {
            window.VVBackend.syncFromServerAsync();
          }
        } catch (e) {
          showErr('Server unavailable. Please try again.');
          return;
        }
        showOk('Product removed.');
        renderProducts();
      });
    });
  }

  imageInput.addEventListener('input', () => {
    if (imageFileInput.files && imageFileInput.files.length) return;
    showPreview(imageInput.value.trim());
  });

  imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files && imageFileInput.files[0] ? imageFileInput.files[0] : null;
    if (!file) {
      showPreview(imageInput.value.trim());
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    showPreview(blobUrl);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const brandInput = document.getElementById('brand').value.trim();
    const price = Number(document.getElementById('price').value);
    const type = document.getElementById('type').value.trim();
    const gender = document.getElementById('gender').value;
    const imageUrl = imageInput.value.trim();
    const sizes = document.getElementById('sizes').value.split(',').map(v => v.trim()).filter(Boolean);
    const colors = document.getElementById('colors').value.split(',').map(v => v.trim()).filter(Boolean);
    const description = document.getElementById('description').value.trim();
    let image = imageUrl;

    const uploadFile = imageFileInput.files && imageFileInput.files[0] ? imageFileInput.files[0] : null;
    if (uploadFile) {
      if (!uploadFile.type.startsWith('image/')) {
        showErr('Please upload a valid image file.');
        return;
      }
      if (uploadFile.size > 2 * 1024 * 1024) {
        showErr('Image size must be 2MB or less.');
        return;
      }
      try {
        image = await readFileAsDataURL(uploadFile);
      } catch (err) {
        showErr('Unable to read selected image.');
        return;
      }
    }

    if (!name || !image || !type || !price || price <= 0) {
      showErr('Please enter valid name, type, image and price.');
      return;
    }

    let id = slugify(name);
    const existing = new Set(VV.getAllProducts().map(p => p.id));
    if (existing.has(id)) id = id + '-' + Date.now();
    const brand = brandInput || (VV.pickBrandForProduct ? VV.pickBrandForProduct({ id, name, type, gender }) : (VV.DEFAULT_BRAND || 'Zara'));

    const product = {
      id,
      brand,
      name,
      price,
      image,
      images: [image],
      description: description || 'Product added by product manager.',
      gender,
      type,
      sizes: sizes.length ? sizes : ['M'],
      colors: colors.length ? colors : ['Default']
    };

    if (!window.VVBackend || typeof window.VVBackend.addProduct !== 'function') {
      showErr('Backend unavailable. Please refresh and try again.');
      return;
    }
    try {
      const result = await window.VVBackend.addProduct(product);
      if (!result || !result.ok || !result.data || !result.data.ok) {
        showErr((result && result.data && result.data.error) ? result.data.error : 'Server sync failed.');
        return;
      }

      const savedProduct = (result.data && result.data.product && typeof result.data.product === 'object')
        ? result.data.product
        : product;
      const adminProducts = VV.getAdminProducts();
      adminProducts.push(savedProduct);
      VV.saveAdminProducts(adminProducts);

      if (typeof window.VVBackend.syncFromServerAsync === 'function') {
        window.VVBackend.syncFromServerAsync();
      }
    } catch (e) {
      showErr('Server unavailable. Please try again.');
      return;
    }
    form.reset();
    showPreview('');
    showOk('Product added successfully.');
    renderProducts();
  });

  renderProducts();

  window.addEventListener('storage', (e) => {
    if (e.key === ADMIN_PRODUCTS_KEY || e.key === REMOVED_BASE_KEY) renderProducts();
  });

