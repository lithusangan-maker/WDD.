  const AUTH_KEY = 'vv_auth';
  const ORDERS_KEY = 'vv_orders';
  const ORDER_SEQ_KEY = 'vv_order_seq';
  const PROFILE_KEY = 'vv_profile';
  const PROFILES_KEY = 'vv_profiles';
  const REG_USERS_KEY = 'vv_registered_users';
  const CART_KEY = 'vv_cart';
  const CART_MAP_KEY = 'vv_cart_by_user';
  const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';
  const LEGACY_DEMO = {
    fullName: 'sarah johnson',
    address: '1234 maple street',
    city: 'los angeles',
    zipCode: '90025',
    email: 'sarah.johnson@email.com',
    phone: '(123) 456-7890'
  };

  function getAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; }
  }

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

  function getProfile(username) {
    const key = profileKey(username);
    if (!key) return {};
    const profiles = loadProfiles();
    return profiles[key] && typeof profiles[key] === 'object' ? profiles[key] : {};
  }

  function saveProfile(username, profile) {
    const key = profileKey(username);
    if (!key) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return;
    }
    const profiles = loadProfiles();
    profiles[key] = {
      ...(profiles[key] || {}),
      ...profile,
      updatedAt: new Date().toISOString()
    };
    saveProfiles(profiles);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles[key]));
  }

  function getRegisteredUsers() {
    try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(REG_USERS_KEY, JSON.stringify(users));
  }

  function getRegisteredCustomer(username) {
    const key = String(username || '').toLowerCase();
    if (!key) return null;
    return getRegisteredUsers().find(user =>
      (user.role || 'customer') === 'customer' &&
      String(user.username || '').toLowerCase() === key
    ) || null;
  }

  function cleanText(value) {
    return String(value || '').trim();
  }

  function isLegacyDemoCustomer(customer) {
    if (!customer || typeof customer !== 'object') return false;
    const fullName = cleanText(customer.fullName).toLowerCase();
    const email = cleanText(customer.email).toLowerCase();
    const phone = cleanText(customer.phone).toLowerCase();
    return fullName === LEGACY_DEMO.fullName && email === LEGACY_DEMO.email && phone === LEGACY_DEMO.phone.toLowerCase();
  }

  function resolveOrderCustomer(order) {
    const base = order && order.customer && typeof order.customer === 'object' ? order.customer : {};
    if (!isLegacyDemoCustomer(base)) return base;

    const matched = getRegisteredCustomer(order && order.username ? order.username : '');
    if (!matched) {
      return {
        fullName: cleanText(order && order.username ? order.username : ''),
        address: '',
        city: '',
        zipCode: '',
        email: '',
        phone: ''
      };
    }

    return {
      fullName: cleanText(matched.name || matched.username || base.fullName),
      address: '',
      city: '',
      zipCode: '',
      email: cleanText(matched.email || base.email),
      phone: cleanText(matched.phone || base.phone)
    };
  }

  function getOrders() {
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

  function normalizeOrders() {
    const orders = getOrders();
    let seq = Number(localStorage.getItem(ORDER_SEQ_KEY) || '0');
    if (!Number.isFinite(seq) || seq < 0) seq = 0;

    orders.forEach(order => {
      const found = parseOrderSeq(order.id);
      if (found !== null) seq = Math.max(seq, found);
    });

    let changed = false;
    const used = new Set();
    const normalized = orders.map(order => {
      const resolvedCustomer = resolveOrderCustomer(order);
      let assignedSeq = parseOrderSeq(order.id);
      if (assignedSeq === null || used.has(assignedSeq)) {
        seq += 1;
        assignedSeq = seq;
      } else if (assignedSeq > seq) {
        seq = assignedSeq;
      }
      used.add(assignedSeq);

      const nextId = formatOrderId(assignedSeq);
      if (
        String(order.id || '') !== nextId ||
        JSON.stringify(order.customer || {}) !== JSON.stringify(resolvedCustomer || {})
      ) {
        changed = true;
        return { ...order, id: nextId, customer: resolvedCustomer };
      }
      return order;
    });

    localStorage.setItem(ORDER_SEQ_KEY, String(seq));
    if (changed) localStorage.setItem(ORDERS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function getNextOrderId() {
    normalizeOrders();
    let seq = Number(localStorage.getItem(ORDER_SEQ_KEY) || '0');
    if (!Number.isFinite(seq) || seq < 0) seq = 0;
    seq += 1;
    localStorage.setItem(ORDER_SEQ_KEY, String(seq));
    return formatOrderId(seq);
  }

  function saveOrder(record) {
    const orders = normalizeOrders();
    orders.unshift(record);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function fillCheckoutDetails() {
    const auth = getAuth();
    const registered = auth && auth.role === 'customer' ? getRegisteredCustomer(auth.username) : null;
    const savedProfile = auth && auth.role === 'customer' ? getProfile(auth.username) : {};
    const base = {
      fullName: cleanText((savedProfile && savedProfile.name) || (registered && (registered.name || registered.username))),
      email: cleanText((savedProfile && savedProfile.email) || (registered && registered.email)),
      phone: cleanText((savedProfile && savedProfile.phone) || (registered && registered.phone)),
      address: cleanText(savedProfile && savedProfile.address),
      city: cleanText(savedProfile && savedProfile.city),
      zipCode: cleanText(savedProfile && savedProfile.zipCode)
    };

    const fullNameInput = document.getElementById('fullName');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const zipCodeInput = document.getElementById('zipCode');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    fullNameInput.value = base.fullName;
    addressInput.value = base.address;
    cityInput.value = base.city;
    zipCodeInput.value = base.zipCode;
    emailInput.value = base.email;
    phoneInput.value = base.phone;
  }

  const orderItems = document.getElementById('orderItems');
  const rawCart = VV.getCart();
  const cart = rawCart.filter(item => !!VV.getProductById(item.productId));
  if (cart.length !== rawCart.length) {
    VV.saveCart(cart);
  }
  let subtotal = 0;
  fillCheckoutDetails();

  if (!cart.length) {
    orderItems.innerHTML = '<p class="muted">No products in cart. <a href="shop.html">Go to shop</a>.</p>';
  } else {
    cart.forEach(item => {
      const p = VV.getProductById(item.productId);
      if (!p) return;
      const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
      const line = p.price * item.qty;
      subtotal += line;
      orderItems.insertAdjacentHTML('beforeend', `<div class="sum-row"><span>${brand} - ${p.name} x ${item.qty}</span><strong>${VV.money(line)}</strong></div>`);
    });
  }

  // Shipping is 20% of order amount so it scales with product total.
  const shipping = subtotal > 0 ? Number((subtotal * 0.2).toFixed(2)) : 0;
  document.getElementById('shipping').textContent = VV.money(shipping);
  document.getElementById('total').textContent = VV.money(subtotal + shipping);
  const popup = document.getElementById('statusPopup');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');
  const popupOk = document.getElementById('popupOk');
  let redirectAfterPopup = '';

  function showPopup(title, message, redirectUrl) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    redirectAfterPopup = redirectUrl || '';
    popup.classList.add('show');
  }

  popupOk.onclick = () => {
    popup.classList.remove('show');
    if (redirectAfterPopup) location.href = redirectAfterPopup;
  };

  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === CART_KEY || e.key === CART_MAP_KEY || e.key === AUTH_KEY || e.key === ADMIN_PRODUCTS_KEY || e.key === REMOVED_BASE_KEY) {
      location.reload();
    }
  });

  document.getElementById('placeOrder').onclick = async () => {
    if (!cart.length) {
      showPopup('Cart Empty', 'Your cart has no items. Please add products before placing order.', 'shop.html');
      return;
    }
    const auth = getAuth();
    if (!auth || auth.role !== 'customer' || !auth.username) {
      showPopup('Login Required', 'Please login as customer to place your order.', 'login.html');
      return;
    }

    const customer = {
      fullName: cleanText(document.getElementById('fullName').value),
      address: cleanText(document.getElementById('address').value),
      city: cleanText(document.getElementById('city').value),
      zipCode: cleanText(document.getElementById('zipCode').value),
      email: cleanText(document.getElementById('email').value),
      phone: cleanText(document.getElementById('phone').value)
    };

    if (!customer.fullName || !customer.address || !customer.city || !customer.zipCode || !customer.email || !customer.phone) {
      showPopup('Missing Details', 'Please fill all customer details before placing order.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      showPopup('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (isLegacyDemoCustomer(customer)) {
      showPopup('Update Details', 'Please enter your own customer details.');
      return;
    }

    const items = cart.map(item => {
      const p = VV.getProductById(item.productId);
      return {
        productId: item.productId,
        productName: p ? p.name : item.productId,
        productBrand: p ? (VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue')) : (VV.DEFAULT_BRAND || 'Velvet Vogue'),
        productImage: p && p.image ? p.image : '',
        qty: item.qty,
        size: item.size || '',
        color: item.color || '',
        unitPrice: p ? p.price : 0,
        lineTotal: p ? p.price * item.qty : 0
      };
    });

    const profilePayload = {
      name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      zipCode: customer.zipCode
    };

    let profileSynced = false;

    try {
      if (window.VVBackend && typeof window.VVBackend.saveProfile === 'function' && auth && auth.username) {
        const profileRes = await window.VVBackend.saveProfile(auth.username, auth.role || 'customer', profilePayload);
        profileSynced = !!(profileRes && profileRes.ok && profileRes.data && profileRes.data.ok);
      }
    } catch (e) {}

    if (profileSynced) {
      saveProfile(auth && auth.username ? auth.username : '', profilePayload);
      if (auth && auth.role === 'customer' && auth.username) {
        const users = getRegisteredUsers();
        const idx = users.findIndex(user => String(user.username || '').toLowerCase() === String(auth.username || '').toLowerCase());
        if (idx >= 0) {
          users[idx] = {
            ...users[idx],
            name: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            zipCode: customer.zipCode
          };
          saveRegisteredUsers(users);
        }
      }
    }

    const draftOrder = {
      id: getNextOrderId(),
      role: auth && auth.role ? auth.role : 'customer',
      username: auth && auth.username ? auth.username : 'guest',
      customer,
      items,
      summary: { subtotal, shipping, total: subtotal + shipping },
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    let finalOrder = null;
    try {
      const res = await fetch('../backend/api.php?action=order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: draftOrder })
      });
      const data = await res.json();
      if (!res.ok || !data || !data.ok) {
        throw new Error((data && data.error) ? data.error : 'Unable to place order.');
      }
      finalOrder = (data.order && typeof data.order === 'object') ? { ...draftOrder, ...data.order } : draftOrder;
      if (typeof data.orderSeq === 'number' && Number.isFinite(data.orderSeq)) {
        localStorage.setItem(ORDER_SEQ_KEY, String(Math.max(0, data.orderSeq)));
      }
    } catch (err) {
      showPopup('Order Failed', (err && err.message) ? err.message : 'Server unavailable. Please try again.');
      return;
    }

    saveOrder(finalOrder);
    if (window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function') {
      window.VVBackend.syncFromServerAsync();
    }
    VV.clearCart();
    showPopup('Order Confirmed', 'Order placed successfully!', 'home.html');
  };

