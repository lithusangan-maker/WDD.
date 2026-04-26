  const AUTH_KEY = 'vv_auth';
  const ORDERS_KEY = 'vv_orders';
  const ORDER_SEQ_KEY = 'vv_order_seq';
  const REG_USERS_KEY = 'vv_registered_users';
  const LEGACY_DEMO = {
    fullName: 'sarah johnson',
    email: 'sarah.johnson@email.com',
    phone: '(123) 456-7890'
  };

  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; }
  }

  function readOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function getRegisteredUsers() {
    try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; }
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
    return (
      cleanText(customer.fullName).toLowerCase() === LEGACY_DEMO.fullName &&
      cleanText(customer.email).toLowerCase() === LEGACY_DEMO.email &&
      cleanText(customer.phone).toLowerCase() === LEGACY_DEMO.phone.toLowerCase()
    );
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

  function saveOrders(list) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  }

  const auth = loadAuth();
  if (!auth) {
    window.location.href = 'login.html';
  } else if (auth.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (auth.role !== 'productManager') {
    window.location.href = 'home.html';
  }

  const wrap = document.getElementById('ordersWrap');

  function statusClass(status) {
    const key = (status || '').toLowerCase();
    if (key === 'delivered') return 'status delivered';
    if (key === 'shipped') return 'status shipped';
    return 'status pending';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getItemImage(item) {
    if (item && item.productImage) return String(item.productImage);
    if (item && item.productId) {
      const current = VV.getProductById(item.productId);
      if (current && current.image) return String(current.image);
    }
    return '';
  }

  function getItemBrand(item) {
    if (item && item.productBrand) return String(item.productBrand);
    if (item && item.productId) {
      const current = VV.getProductById(item.productId);
      if (current) {
        if (VV.getProductBrand) return VV.getProductBrand(current);
        return String(current.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
      }
    }
    if (VV.pickBrandForProduct) {
      return VV.pickBrandForProduct({
        id: item && item.productId ? item.productId : '',
        name: item && item.productName ? item.productName : '',
        brand: ''
      });
    }
    return String(VV.DEFAULT_BRAND || 'Velvet Vogue');
  }

  function renderOrders() {
    const orders = getOrders().filter(order => (order.role || 'customer') === 'customer');
    wrap.innerHTML = '';
    if (!orders.length) {
      wrap.innerHTML = '<div class="card empty muted">No customer orders placed yet.</div>';
      return;
    }

    orders.forEach(order => {
      const customer = order.customer || {};
      const summary = order.summary || {};
      const items = Array.isArray(order.items) ? order.items : [];
      const dateText = new Date(order.createdAt || Date.now()).toLocaleString();
      const status = order.status || 'Pending';
      const fullAddress = [customer.address, customer.city, customer.zipCode].filter(Boolean).join(' ').trim() || '-';

      wrap.insertAdjacentHTML('beforeend', `
        <section class="card order-card" data-order="${order.id}">
          <div class="order-top">
            <div class="order-meta">
              <h2 class="subtitle" style="margin:0">Order ID: ${order.id || '-'}</h2>
              <div class="muted">Placed by: ${order.username || '-'} (${order.role || 'customer'})</div>
              <div class="muted">${dateText}</div>
            </div>
            <div class="${statusClass(status)}">${status}</div>
          </div>

          <div class="order-grid">
            <div>
              <div class="item-table">
                <div class="item-row item-head"><div>Product</div><div>Qty</div><div>Unit</div><div>Total</div></div>
                ${items.map(item => `
                  <div class="item-row">
                    <div>
                      ${(() => {
                        const imageSrc = getItemImage(item);
                        const brand = getItemBrand(item);
                        const imageHtml = imageSrc
                          ? `<div class="item-product-thumb"><img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(item.productName || item.productId || 'Product')}" loading="lazy" onerror="this.onerror=null;this.src='../assets/images/product-fallback.svg';"></div>`
                          : '<div class="item-product-thumb empty">No image</div>';
                        return `
                          <div class="item-product">
                            ${imageHtml}
                            <div>
                              <div class="muted">${escapeHtml(brand)}</div>
                              <strong>${escapeHtml(item.productName || item.productId || '-')}</strong>
                              <div class="muted">${escapeHtml(item.size || '-')} / ${escapeHtml(item.color || '-')}</div>
                            </div>
                          </div>
                        `;
                      })()}
                    </div>
                    <div>${item.qty || 0}</div>
                    <div>${VV.money(item.unitPrice || 0)}</div>
                    <div>${VV.money(item.lineTotal || 0)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="summary-box">
              <strong>Customer</strong>
              <div>${customer.fullName || '-'}</div>
              <div class="muted">${customer.email || '-'}</div>
              <div class="muted">${customer.phone || '-'}</div>
              <div class="muted">${fullAddress}</div>
              <hr style="border:none;border-top:1px solid var(--line);margin:2px 0">
              <div class="sum-row"><span>Subtotal</span><strong>${VV.money(summary.subtotal || 0)}</strong></div>
              <div class="sum-row"><span>Shipping</span><strong>${VV.money(summary.shipping || 0)}</strong></div>
              <div class="sum-row"><span>Total</span><strong>${VV.money(summary.total || 0)}</strong></div>
              <div class="status-row">
                <select class="input" data-status-select="${order.id}">
                  <option ${status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn-outline" type="button" data-status-save="${order.id}">Update</button>
              </div>
            </div>
          </div>
        </section>
      `);
    });

    wrap.querySelectorAll('[data-status-save]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.statusSave;
        const sel = wrap.querySelector('[data-status-select="' + id + '"]');
        if (!sel) return;
        const nextStatus = sel.value;
        if (!window.VVBackend || typeof window.VVBackend.updateOrderStatus !== 'function') {
          alert('Backend unavailable. Please refresh and try again.');
          return;
        }
        try {
          const result = await window.VVBackend.updateOrderStatus(id, nextStatus);
          if (!result || !result.ok || !result.data || !result.data.ok) {
            throw new Error((result && result.data && result.data.error) ? result.data.error : 'Server sync failed');
          }
          const orders = getOrders();
          const idx = orders.findIndex(o => o.id === id);
          if (idx < 0) return;
          orders[idx].status = nextStatus;
          saveOrders(orders);
          if (typeof window.VVBackend.syncFromServerAsync === 'function') {
            window.VVBackend.syncFromServerAsync();
          }
        } catch (e) {
          alert((e && e.message) ? e.message : 'Server unavailable. Please try again.');
          return;
        }
        renderOrders();
      });
    });
  }

  renderOrders();

  window.addEventListener('storage', (e) => {
    if (e.key === ORDERS_KEY) renderOrders();
  });

