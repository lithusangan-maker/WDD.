  const AUTH_KEY = 'vv_auth';
  const PROFILE_KEY = 'vv_profile';
  const PROFILES_KEY = 'vv_profiles';
  const REG_USERS_KEY = 'vv_registered_users';
  const ORDERS_KEY = 'vv_orders';
  const ORDER_SEQ_KEY = 'vv_order_seq';
  const CART_KEY = 'vv_cart';
  const CART_MAP_KEY = 'vv_cart_by_user';
  const CART_OWNER_KEY = 'vv_cart_owner';
  const ROLE_DEFAULT_PROFILES = {
    admin: {
      name: 'Admin',
      email: 'admin@velvetvogue.com',
      phone: '011-000-0001',
      address: 'Velvet Vogue Head Office',
      city: 'Colombo',
      zipCode: '00100',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80'
    },
    productManager: {
      name: 'Product Manager',
      email: 'manager@velvetvogue.com',
      phone: '011-000-0002',
      address: 'Velvet Vogue Operations',
      city: 'Colombo',
      zipCode: '00200',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
    },
    customer: {
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80'
    }
  };

  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; }
  }

  const auth = loadAuth();
  if (!auth || !auth.username) {
    window.location.href = 'login.html';
  }
  const isManager = auth.role === 'productManager';
  let currentProfile = {};
  let pendingImageData = '';
  const adminLink = document.getElementById('adminLink');
  const managerLink = document.getElementById('managerLink');
  const wishlistLink = document.getElementById('wishlistLink');
  const cartLink = document.getElementById('cartLink');
  const checkoutLink = document.getElementById('checkoutLink');
  const continueShoppingLink = document.getElementById('continueShoppingLink');
  const profileMeta = document.getElementById('profileMeta');
  const zipCodeGroup = document.getElementById('zipCodeGroup');
  const addressLabel = document.getElementById('addressLabel');
  const addressInput = document.getElementById('addressInput');
  const cityLabel = document.getElementById('cityLabel');
  const cityInput = document.getElementById('cityInput');
  const accountSummarySection = document.getElementById('accountSummarySection');
  const ordersSection = document.getElementById('ordersSection');
  const pageTitle = document.querySelector('main .title');

  function hideElement(el) {
    if (!el) return;
    el.style.display = 'none';
  }

  function applyManagerProfileView() {
    if (!isManager) return;
    if (pageTitle) pageTitle.textContent = 'Manager Profile';
    hideElement(profileMeta);
    hideElement(cartLink);
    hideElement(checkoutLink);
    hideElement(continueShoppingLink);
    hideElement(wishlistLink);
    hideElement(zipCodeGroup);
    hideElement(addressLabel);
    hideElement(addressInput);
    hideElement(cityLabel);
    hideElement(cityInput);
    hideElement(accountSummarySection);
    hideElement(ordersSection);
  }

  if (auth && auth.role === 'admin' && adminLink) adminLink.style.display = 'flex';
  if (auth && auth.role === 'productManager' && managerLink) managerLink.style.display = 'flex';
  if (auth && auth.role === 'customer' && wishlistLink) wishlistLink.style.display = 'flex';
  applyManagerProfileView();

  function loadProfiles() {
    try {
      const raw = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) {
      return {};
    }
  }

  function saveProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles || {}));
  }

  function profileKey(username) {
    return String(username || '').trim().toLowerCase();
  }

  function getRegisteredUsers() {
    try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(REG_USERS_KEY, JSON.stringify(users));
  }

  function getRegisteredCustomer(username) {
    const key = profileKey(username);
    if (!key) return null;
    return getRegisteredUsers().find(user =>
      (user.role || 'customer') === 'customer' &&
      String(user.username || '').toLowerCase() === key
    ) || null;
  }

  function loadProfile() {
    const key = profileKey(auth && auth.username ? auth.username : '');
    const profiles = loadProfiles();
    const fromMap = key ? profiles[key] : null;
    if (fromMap && typeof fromMap === 'object') {
      if (auth && auth.role && auth.role !== 'customer') {
        const defaults = ROLE_DEFAULT_PROFILES[auth.role] || {};
        return {
          ...defaults,
          ...fromMap,
          name: fromMap.name || defaults.name || auth.username || '',
          role: auth.role
        };
      }
      return fromMap;
    }

    const regUser = getRegisteredCustomer(auth && auth.username ? auth.username : '');
    if (regUser) {
      return {
        name: regUser.name || regUser.username || '',
        email: regUser.email || '',
        phone: regUser.phone || '',
        address: regUser.address || '',
        city: regUser.city || '',
        zipCode: regUser.zipCode || ''
      };
    }

    if (auth && auth.role && auth.role !== 'customer') {
      const defaults = ROLE_DEFAULT_PROFILES[auth.role] || {};
      return {
        ...defaults,
        name: defaults.name || auth.username || '',
        role: auth.role
      };
    }

    try {
      const legacy = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      return legacy && typeof legacy === 'object' ? legacy : {};
    } catch (e) {
      return {};
    }
  }

  function saveProfile(data) {
    const key = profileKey(auth && auth.username ? auth.username : '');
    if (!key) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      return;
    }
    const defaults = ROLE_DEFAULT_PROFILES[auth && auth.role ? auth.role : ''] || {};
    const profiles = loadProfiles();
    profiles[key] = {
      ...defaults,
      ...(profiles[key] || {}),
      ...data,
      role: auth && auth.role ? auth.role : (profiles[key] && profiles[key].role ? profiles[key].role : 'customer'),
      updatedAt: new Date().toISOString()
    };
    saveProfiles(profiles);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles[key]));
  }

  function getRoleDefaultImage() {
    const roleDefaults = ROLE_DEFAULT_PROFILES[auth && auth.role ? auth.role : 'customer'] || ROLE_DEFAULT_PROFILES.customer;
    return roleDefaults.image || ROLE_DEFAULT_PROFILES.customer.image;
  }

  function setProfileImage(src) {
    const profileImage = document.getElementById('profileImage');
    if (!profileImage) return;
    const fallback = getRoleDefaultImage();
    profileImage.onerror = () => {
      profileImage.onerror = null;
      profileImage.src = fallback;
    };
    profileImage.src = src || fallback;
  }

  function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Image read failed'));
      reader.readAsDataURL(file);
    });
  }

  function readOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function parseOrderSeq(value) {
    const text = String(value || '').trim();
    let match = /^#(\d+)$/i.exec(text);
    if (match) return Number(match[1]);
    match = /^ORDER-(\d+)$/i.exec(text);
    if (match) return Number(match[1]);
    return null;
  }

  function formatOrderId(seq) {
    return '#' + String(seq).padStart(3, '0');
  }

  function getOrders() {
    const orders = readOrders();
    let seq = Number(localStorage.getItem(ORDER_SEQ_KEY) || '0');
    if (!Number.isFinite(seq) || seq < 0) seq = 0;

    orders.forEach(order => {
      const found = parseOrderSeq(order.id);
      if (found !== null) seq = Math.max(seq, found);
    });

    let changed = false;
    const used = new Set();
    const normalized = orders.map(order => {
      let assignedSeq = parseOrderSeq(order.id);
      if (assignedSeq === null || used.has(assignedSeq)) {
        seq += 1;
        assignedSeq = seq;
      } else if (assignedSeq > seq) {
        seq = assignedSeq;
      }
      used.add(assignedSeq);

      const nextId = formatOrderId(assignedSeq);
      if (String(order.id || '') !== nextId) {
        changed = true;
        return { ...order, id: nextId };
      }
      return order;
    });

    localStorage.setItem(ORDER_SEQ_KEY, String(seq));
    if (changed) localStorage.setItem(ORDERS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function applyProfile(profile) {
    currentProfile = profile && typeof profile === 'object' ? { ...profile } : {};
    pendingImageData = '';
    const name = profile.name || auth.username || '-';
    const email = profile.email || '-';
    setProfileImage(profile.image || getRoleDefaultImage());
    document.getElementById('nameText').textContent = name;
    document.getElementById('emailText').textContent = email;
    document.getElementById('nameInput').value = name === '-' ? '' : name;
    document.getElementById('emailInput').value = email === '-' ? '' : email;
    document.getElementById('phoneInput').value = profile.phone || '';
    document.getElementById('addressInput').value = profile.address || '';
    document.getElementById('cityInput').value = profile.city || '';
    document.getElementById('zipCodeInput').value = profile.zipCode || '';
    document.getElementById('imageInput').value = profile.image || '';
  }

  function renderSummary() {
    const cart = VV.getCart();
    let totalQty = 0;
    let subtotal = 0;
    const uniqueCount = new Set();

    cart.forEach(item => {
      const p = VV.getProductById(item.productId);
      if (!p) return;
      totalQty += item.qty;
      subtotal += p.price * item.qty;
      uniqueCount.add(item.productId);
    });

    document.getElementById('itemsCount').textContent = totalQty;
    document.getElementById('cartTotal').textContent = VV.money(subtotal);
    document.getElementById('uniqueCount').textContent = uniqueCount.size;

    const shipping = subtotal > 0 ? Number((subtotal * 0.2).toFixed(2)) : 0;
    const tax = subtotal * 0.08;
    const estimatedTotal = subtotal + shipping + tax;
    const tier = estimatedTotal >= 300 ? 'Platinum' : estimatedTotal >= 150 ? 'Gold' : 'Silver';

    document.getElementById('subtotalText').textContent = VV.money(subtotal);
    document.getElementById('shippingText').textContent = VV.money(shipping);
    document.getElementById('taxText').textContent = VV.money(tax);
    document.getElementById('estimatedTotalText').textContent = VV.money(estimatedTotal);
    document.getElementById('tierText').textContent = tier;
  }

  function renderMyOrders() {
    const list = document.getElementById('ordersList');
    const myOrders = getOrders()
      .filter(order => (order.username || '').toLowerCase() === (auth.username || '').toLowerCase())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    list.innerHTML = '';
    if (!myOrders.length) {
      list.innerHTML = '<div class="muted">No orders placed yet. <a href="shop.html">Start shopping</a>.</div>';
      return;
    }

    myOrders.forEach(order => {
      const total = order.summary && order.summary.total ? order.summary.total : 0;
      const status = order.status || 'Pending';
      const itemsCount = Array.isArray(order.items) ? order.items.reduce((sum, i) => sum + Number(i.qty || 0), 0) : 0;
      const when = order.createdAt ? new Date(order.createdAt).toLocaleString() : '-';
      list.insertAdjacentHTML('beforeend', `
        <article class="order-row">
          <div>
            <div class="product-name" style="font-size:18px">Order ID: ${order.id || '-'}</div>
            <div class="muted">${itemsCount} item(s) - ${when} - ${status}</div>
          </div>
          <strong>${VV.money(total)}</strong>
        </article>
      `);
    });
  }

  const imageInput = document.getElementById('imageInput');
  const imageFileInput = document.getElementById('imageFileInput');
  const clearImageBtn = document.getElementById('clearImageBtn');

  function resolveSelectedImage() {
    const typedImage = imageInput.value.trim();
    if (typedImage) return typedImage;
    if (pendingImageData) return pendingImageData;
    return currentProfile.image || getRoleDefaultImage();
  }

  imageInput.addEventListener('input', () => {
    pendingImageData = '';
    if (imageFileInput) imageFileInput.value = '';
    setProfileImage(resolveSelectedImage());
  });

  imageFileInput.addEventListener('change', async () => {
    const file = imageFileInput.files && imageFileInput.files[0] ? imageFileInput.files[0] : null;
    if (!file) {
      pendingImageData = '';
      setProfileImage(resolveSelectedImage());
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      imageFileInput.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be 2MB or less.');
      imageFileInput.value = '';
      return;
    }
    try {
      pendingImageData = await readImageAsDataUrl(file);
      imageInput.value = '';
      setProfileImage(pendingImageData);
    } catch (e) {
      pendingImageData = '';
      alert('Unable to read selected image.');
      imageFileInput.value = '';
    }
  });

  clearImageBtn.addEventListener('click', () => {
    pendingImageData = '';
    imageFileInput.value = '';
    imageInput.value = '';
    const defaultImage = getRoleDefaultImage();
    currentProfile = { ...(currentProfile || {}), image: defaultImage };
    setProfileImage(defaultImage);
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    let profile = {
      name: document.getElementById('nameInput').value.trim(),
      email: document.getElementById('emailInput').value.trim(),
      phone: document.getElementById('phoneInput').value.trim(),
      address: document.getElementById('addressInput').value.trim(),
      city: document.getElementById('cityInput').value.trim(),
      zipCode: document.getElementById('zipCodeInput').value.trim()
    };
    profile.image = resolveSelectedImage();

    if (!profile.name || !profile.email) {
      alert('Please enter name and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      alert('Please enter a valid email.');
      return;
    }

    if (!window.VVBackend || typeof window.VVBackend.saveProfile !== 'function') {
      alert('Backend unavailable. Please refresh and try again.');
      return;
    }

    try {
      const result = await window.VVBackend.saveProfile(auth.username, auth.role || 'customer', profile);
      if (!result || !result.ok || !result.data || !result.data.ok) {
        alert((result && result.data && result.data.error) ? result.data.error : 'Unable to save profile.');
        return;
      }
      if (result.data.profile && typeof result.data.profile === 'object') {
        profile = { ...profile, ...result.data.profile };
      }
    } catch (e) {
      alert('Server unavailable. Please try again.');
      return;
    }

    saveProfile(profile);

    if (auth && auth.role === 'customer' && auth.username) {
      const users = getRegisteredUsers();
      const idx = users.findIndex(user => String(user.username || '').toLowerCase() === String(auth.username || '').toLowerCase());
      if (idx >= 0) {
        users[idx] = {
          ...users[idx],
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          zipCode: profile.zipCode
        };
        saveRegisteredUsers(users);
      }
    }

    if (window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function') {
      window.VVBackend.syncFromServerAsync();
    }

    applyProfile(profile);
    imageFileInput.value = '';
    alert('Account updated successfully.');
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(CART_OWNER_KEY);
      localStorage.setItem(CART_KEY, '[]');
      window.location.href = 'login.html';
    });
  }

  applyProfile(loadProfile());
  if (!isManager) {
    renderSummary();
    renderMyOrders();
  }

  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (!isManager && e.key === ORDERS_KEY) renderMyOrders();
    if (!isManager && (e.key === CART_KEY || e.key === CART_MAP_KEY || e.key === AUTH_KEY)) renderSummary();
    if (e.key === PROFILES_KEY || e.key === PROFILE_KEY || e.key === REG_USERS_KEY) {
      applyProfile(loadProfile());
    }
  });

