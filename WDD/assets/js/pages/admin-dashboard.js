  const AUTH_KEY = 'vv_auth';
  const ORDERS_KEY = 'vv_orders';
  const REG_USERS_KEY = 'vv_registered_users';
  const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';

  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; }
  }

  function readOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function readRegisteredUsers() {
    try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function getRemovedBaseProductIds() {
    if (window.VV && typeof VV.getRemovedBaseProductIds === 'function') {
      return VV.getRemovedBaseProductIds();
    }
    try {
      const raw = JSON.parse(localStorage.getItem(REMOVED_BASE_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(v => String(v)).filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeStatus(status) {
    const text = String(status || '').toLowerCase();
    if (text === 'shipped') return 'Shipped';
    if (text === 'delivered') return 'Delivered';
    return 'Pending';
  }

  function dayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function dayLabel(date) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }

  function buildSevenDaysBuckets() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days.map(d => ({ key: dayKey(d), label: dayLabel(d), date: d }));
  }

  function buildSeries(items, dateField, valueFn) {
    const buckets = buildSevenDaysBuckets();
    const map = new Map(buckets.map(b => [b.key, { label: b.label, value: 0 }]));
    items.forEach(item => {
      const dt = new Date(item && item[dateField] ? item[dateField] : 0);
      if (Number.isNaN(dt.getTime())) return;
      dt.setHours(0, 0, 0, 0);
      const row = map.get(dayKey(dt));
      if (!row) return;
      row.value += Number(valueFn(item) || 0);
    });
    return buckets.map(b => map.get(b.key));
  }

  const auth = loadAuth();
  if (!auth || auth.role !== 'admin') {
    window.location.href = 'login.html';
  }

  const statusDonut = document.getElementById('statusDonut');
  const donutTotal = document.getElementById('donutTotal');
  const statusLegend = document.getElementById('statusLegend');
  const ordersBars = document.getElementById('ordersBars');
  const usersBars = document.getElementById('usersBars');
  const ordersPeak = document.getElementById('ordersPeak');
  const usersPeak = document.getElementById('usersPeak');
  const ordersBarsNote = document.getElementById('ordersBarsNote');
  const usersBarsNote = document.getElementById('usersBarsNote');
  const revenueSvg = document.getElementById('revenueSvg');
  const revenueRange = document.getElementById('revenueRange');
  const revenueLabel = document.getElementById('revenueLabel');
  const topProducts = document.getElementById('topProducts');
  const recentOrders = document.getElementById('recentOrders');
  const recentUsers = document.getElementById('recentUsers');

  function renderStatusDonut(orders) {
    const map = [
      { key: 'Pending', color: '#b78b62' },
      { key: 'Shipped', color: '#5f7fa4' },
      { key: 'Delivered', color: '#2f6b45' }
    ];
    const counts = { Pending: 0, Shipped: 0, Delivered: 0 };
    orders.forEach(order => {
      counts[normalizeStatus(order.status)] += 1;
    });

    const total = orders.length;
    donutTotal.textContent = total;
    if (!total) {
      statusDonut.style.background = '#efe6dc';
      statusLegend.innerHTML = '<div class="admin-chart-empty">No orders yet.</div>';
      return;
    }

    let cursor = 0;
    const segments = map.map(item => {
      const size = (counts[item.key] / total) * 360;
      const start = cursor;
      cursor += size;
      return item.color + ' ' + start.toFixed(2) + 'deg ' + cursor.toFixed(2) + 'deg';
    });
    statusDonut.style.background = 'conic-gradient(' + segments.join(',') + ')';
    statusLegend.innerHTML = map.map(item => `
      <div class="admin-legend-row">
        <div class="admin-legend-left">
          <span class="admin-swatch" style="background:${item.color}"></span>
          <span>${item.key}</span>
        </div>
        <strong>${counts[item.key]}</strong>
      </div>
    `).join('');
  }

  function renderBars(target, peakTarget, noteTarget, series, totalLabel, emptyText, barClass) {
    const maxValue = Math.max(...series.map(row => row.value), 0);
    target.innerHTML = series.map(row => {
      const height = maxValue ? Math.max(8, Math.round((row.value / maxValue) * 100)) : 8;
      const classes = row.value ? ('admin-bar ' + barClass) : 'admin-bar empty';
      return `
        <div class="admin-bar-col">
          <div class="admin-bar-track">
            <div class="${classes.trim()}" style="height:${height}%"><span>${row.value}</span></div>
          </div>
          <small>${row.label}</small>
        </div>
      `;
    }).join('');
    const total = series.reduce((sum, row) => sum + row.value, 0);
    peakTarget.textContent = 'Peak ' + maxValue;
    noteTarget.textContent = total ? (totalLabel + ' ' + total) : emptyText;
  }

  function renderRevenueTrend(series) {
    const maxRevenue = Math.max(...series.map(row => row.value), 0);
    const totalRevenue = series.reduce((sum, row) => sum + row.value, 0);
    revenueLabel.textContent = 'Revenue ' + VV.money(totalRevenue);
    revenueRange.innerHTML = `<span>${series[0].label}</span><span>${series[6].label}</span>`;

    const gridLines = [8, 18, 28, 38]
      .map(y => `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#eadfd3" stroke-width="0.4"></line>`)
      .join('');

    if (maxRevenue <= 0) {
      revenueSvg.innerHTML = `
        ${gridLines}
        <text x="50" y="24" text-anchor="middle" fill="#8b7764" font-size="4">No revenue data</text>
      `;
      return;
    }

    const points = series.map((row, idx) => {
      const x = (idx / (series.length - 1)) * 100;
      const y = 42 - ((row.value / maxRevenue) * 34);
      return { x, y };
    });
    const linePoints = points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const areaPath = `M ${points[0].x.toFixed(2)} 42 L ${linePoints.replace(/ /g, ' L ')} L ${points[points.length - 1].x.toFixed(2)} 42 Z`;
    const dots = points.map(p => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="1.3" fill="#a97f58"></circle>`).join('');

    revenueSvg.innerHTML = `
      ${gridLines}
      <path d="${areaPath}" fill="rgba(183,139,98,.18)"></path>
      <polyline points="${linePoints}" fill="none" stroke="#a97f58" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${dots}
    `;
  }

  function renderTopProducts(orders) {
    const counts = {};
    orders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach(item => {
        const brand = VV.pickBrandForProduct
          ? VV.pickBrandForProduct({ id: item.productId, name: item.productName, brand: item.productBrand })
          : String(item.productBrand || VV.DEFAULT_BRAND || 'Zara').trim();
        const name = String(item.productName || item.productId || 'Unknown Product').trim();
        const label = (brand ? (brand + ' - ') : '') + name;
        const qty = Number(item.qty || 0);
        if (!name || qty <= 0) return;
        counts[label] = (counts[label] || 0) + qty;
      });
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!top.length) {
      topProducts.innerHTML = '<div class="admin-chart-empty">No product sales yet.</div>';
      return;
    }
    const maxQty = top[0][1] || 1;
    topProducts.innerHTML = top.map(([name, qty]) => `
      <div class="admin-top-item">
        <div class="admin-row-top">
          <span>${escapeHtml(name)}</span>
          <strong>${qty}</strong>
        </div>
        <div class="admin-top-track">
          <div class="admin-top-fill" style="width:${Math.max(8, Math.round((qty / maxQty) * 100))}%"></div>
        </div>
      </div>
    `).join('');
  }

  function renderRecentOrders(orders) {
    const list = orders.slice().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6);
    if (!list.length) {
      recentOrders.innerHTML = '<div class="admin-chart-empty">No orders yet.</div>';
      return;
    }
    recentOrders.innerHTML = list.map(order => {
      const customerName = order.customer && order.customer.fullName ? order.customer.fullName : (order.username || 'Customer');
      const status = normalizeStatus(order.status);
      const dateText = order.createdAt ? new Date(order.createdAt).toLocaleString() : '-';
      const total = VV.money(order.summary && order.summary.total ? order.summary.total : 0);
      return `
        <article class="admin-row">
          <div class="admin-row-top">
            <strong>${escapeHtml(order.id || '-')}</strong>
            <span class="status ${status.toLowerCase()}">${status}</span>
          </div>
          <div class="muted">${escapeHtml(customerName)} - ${escapeHtml(dateText)}</div>
          <div><strong>${total}</strong></div>
        </article>
      `;
    }).join('');
  }

  function renderRecentUsers(users) {
    const list = users.slice().sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()).slice(0, 6);
    if (!list.length) {
      recentUsers.innerHTML = '<div class="admin-chart-empty">No customer registrations yet.</div>';
      return;
    }
    recentUsers.innerHTML = list.map(user => `
      <article class="admin-row">
        <div class="admin-row-top">
          <strong>${escapeHtml(user.username || '-')}</strong>
          <span class="muted">${escapeHtml(user.phone || '-')}</span>
        </div>
        <div>${escapeHtml(user.name || '-')}</div>
        <div class="muted">${escapeHtml(user.email || '-')}</div>
      </article>
    `).join('');
  }

  function renderDashboard() {
    const allProducts = VV.getAllProducts();
    const managerProducts = VV.getAdminProducts();
    const removedBase = getRemovedBaseProductIds();
    const orders = readOrders().filter(order => (order.role || 'customer') === 'customer');
    const users = readRegisteredUsers().filter(user => (user.role || 'customer') === 'customer');
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.summary && order.summary.total ? order.summary.total : 0), 0);

    document.getElementById('totalProducts').textContent = allProducts.length;
    document.getElementById('managerProducts').textContent = managerProducts.length;
    document.getElementById('removedProducts').textContent = removedBase.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = VV.money(totalRevenue);
    document.getElementById('totalCustomers').textContent = users.length;
    document.getElementById('lastSync').textContent = 'Updated ' + new Date().toLocaleTimeString();

    renderStatusDonut(orders);
    renderBars(
      ordersBars,
      ordersPeak,
      ordersBarsNote,
      buildSeries(orders, 'createdAt', () => 1),
      'Orders (7 days):',
      'No orders in the last 7 days',
      ''
    );
    renderBars(
      usersBars,
      usersPeak,
      usersBarsNote,
      buildSeries(users, 'registeredAt', () => 1),
      'Registrations (7 days):',
      'No registrations in the last 7 days',
      'alt'
    );
    renderRevenueTrend(buildSeries(orders, 'createdAt', order => Number(order.summary && order.summary.total ? order.summary.total : 0)));
    renderTopProducts(orders);
    renderRecentOrders(orders);
    renderRecentUsers(users);
  }

  renderDashboard();

  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === ORDERS_KEY || e.key === REG_USERS_KEY || e.key === ADMIN_PRODUCTS_KEY || e.key === REMOVED_BASE_KEY) {
      renderDashboard();
    }
  });

