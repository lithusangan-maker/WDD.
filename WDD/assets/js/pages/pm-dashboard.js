  const AUTH_KEY = 'vv_auth';
  const ORDERS_KEY = 'vv_orders';
  const ORDER_SEQ_KEY = 'vv_order_seq';
  const REG_USERS_KEY = 'vv_registered_users';
  const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
  const REMOVED_BASE_KEY = 'vv_removed_base_products';
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
    const customers = getRegisteredCustomers();
    let seq = Number(localStorage.getItem(ORDER_SEQ_KEY) || '0');
    if (!Number.isFinite(seq) || seq < 0) seq = 0;

    orders.forEach(order => {
      const found = parseOrderSeq(order.id);
      if (found !== null) seq = Math.max(seq, found);
    });

    let changed = false;
    const used = new Set();
    const normalized = orders.map(order => {
      const baseCustomer = order && order.customer && typeof order.customer === 'object' ? order.customer : {};
      let resolvedCustomer = baseCustomer;
      if (isLegacyDemoCustomer(baseCustomer)) {
        const matched = customers.find(user => String(user.username || '').toLowerCase() === String(order.username || '').toLowerCase());
        if (matched) {
          resolvedCustomer = {
            fullName: cleanText(matched.name || matched.username || baseCustomer.fullName),
            address: '',
            city: '',
            zipCode: '',
            email: cleanText(matched.email || baseCustomer.email),
            phone: cleanText(matched.phone || baseCustomer.phone)
          };
        } else {
          resolvedCustomer = {
            fullName: cleanText(order.username || ''),
            address: '',
            city: '',
            zipCode: '',
            email: '',
            phone: ''
          };
        }
      }

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

  function getRegisteredCustomers() {
    const users = (() => { try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; } })();
    return users.filter(user => (user.role || 'customer') === 'customer');
  }

  function statusClass(status) {
    const key = (status || '').toLowerCase();
    if (key === 'delivered') return 'status delivered';
    if (key === 'shipped') return 'status shipped';
    return 'status pending';
  }

  const auth = loadAuth();
  if (!auth) {
    window.location.href = 'login.html';
  } else if (auth.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (auth.role !== 'productManager') {
    window.location.href = 'home.html';
  }

  const orderList = document.getElementById('orderList');
  const userList = document.getElementById('userList');
  const statusDonut = document.getElementById('statusDonut');
  const donutTotal = document.getElementById('donutTotal');
  const statusLegend = document.getElementById('statusLegend');
  const weeklyBars = document.getElementById('weeklyBars');
  const barPeak = document.getElementById('barPeak');
  const barsNote = document.getElementById('barsNote');
  const revenueSvg = document.getElementById('revenueSvg');
  const revenueLabels = document.getElementById('revenueLabels');
  const revenueTotal = document.getElementById('revenueTotal');
  const topProducts = document.getElementById('topProducts');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function buildWeeklySeries(customerOrders) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    const buckets = new Map(days.map(d => [dayKey(d), { date: d, label: dayLabel(d), count: 0, revenue: 0 }]));
    customerOrders.forEach(order => {
      const dt = new Date(order.createdAt || 0);
      if (Number.isNaN(dt.getTime())) return;
      dt.setHours(0, 0, 0, 0);
      const row = buckets.get(dayKey(dt));
      if (!row) return;
      row.count += 1;
      row.revenue += Number(order.summary && order.summary.total ? order.summary.total : 0);
    });

    return days.map(d => buckets.get(dayKey(d)));
  }

  function renderStatusChart(customerOrders) {
    const statusMap = [
      { key: 'Pending', label: 'Pending', color: '#b78b62' },
      { key: 'Shipped', label: 'Shipped', color: '#5f7fa4' },
      { key: 'Delivered', label: 'Delivered', color: '#2f6b45' }
    ];
    const counts = { Pending: 0, Shipped: 0, Delivered: 0 };
    customerOrders.forEach(order => {
      const status = String(order.status || 'Pending');
      if (status === 'Shipped' || status === 'Delivered') counts[status] += 1;
      else counts.Pending += 1;
    });

    const total = customerOrders.length;
    donutTotal.textContent = total;
    if (!total) {
      statusDonut.style.background = '#efe6dc';
      statusLegend.innerHTML = '<div class="pm-chart-empty">No customer orders yet.</div>';
      return;
    }

    let cursor = 0;
    const segments = statusMap.map(item => {
      const size = (counts[item.key] / total) * 360;
      const start = cursor;
      cursor += size;
      return item.color + ' ' + start.toFixed(2) + 'deg ' + cursor.toFixed(2) + 'deg';
    });
    statusDonut.style.background = 'conic-gradient(' + segments.join(',') + ')';
    statusLegend.innerHTML = statusMap.map(item => `
      <div class="pm-legend-row">
        <div class="pm-legend-left">
          <span class="pm-swatch" style="background:${item.color}"></span>
          <span>${item.label}</span>
        </div>
        <strong>${counts[item.key]}</strong>
      </div>
    `).join('');
  }

  function renderWeeklyBars(series) {
    const maxCount = Math.max(...series.map(row => row.count), 0);
    weeklyBars.innerHTML = series.map(row => {
      const height = maxCount ? Math.max(8, Math.round((row.count / maxCount) * 100)) : 8;
      const barClass = row.count ? 'pm-bar' : 'pm-bar empty';
      return `
        <div class="pm-bar-col">
          <div class="${barClass}" style="height:${height}%"><span>${row.count}</span></div>
          <small>${row.label}</small>
        </div>
      `;
    }).join('');

    const totalOrders = series.reduce((sum, row) => sum + row.count, 0);
    barPeak.textContent = 'Peak ' + maxCount + ' order(s)';
    barsNote.textContent = totalOrders ? (totalOrders + ' order(s) in the last 7 days') : 'No orders in the last 7 days';
  }

  function renderRevenueTrend(series) {
    const maxRevenue = Math.max(...series.map(row => row.revenue), 0);
    const totalRevenue = series.reduce((sum, row) => sum + row.revenue, 0);
    revenueTotal.textContent = 'Revenue ' + VV.money(totalRevenue);
    revenueLabels.innerHTML = `<span>${series[0].label}</span><span>${series[6].label}</span>`;

    const gridLines = [8, 18, 28, 38]
      .map(y => `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#eadfD3" stroke-width="0.4"></line>`)
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
      const y = 42 - ((row.revenue / maxRevenue) * 34);
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

  function renderTopProducts(customerOrders) {
    const productCount = {};
    customerOrders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach(item => {
        const brand = VV.pickBrandForProduct
          ? VV.pickBrandForProduct({ id: item.productId, name: item.productName, brand: item.productBrand })
          : String(item.productBrand || VV.DEFAULT_BRAND || 'Zara').trim();
        const name = String(item.productName || item.productId || 'Unknown Product').trim();
        const label = (brand ? (brand + ' - ') : '') + name;
        const qty = Number(item.qty || 0);
        if (!name || qty <= 0) return;
        productCount[label] = (productCount[label] || 0) + qty;
      });
    });

    const top = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!top.length) {
      topProducts.innerHTML = '<div class="pm-chart-empty">No product sales yet.</div>';
      return;
    }

    const maxQty = top[0][1] || 1;
    topProducts.innerHTML = top.map(([name, qty]) => `
      <div class="pm-top-item">
        <div class="activity-top">
          <span>${escapeHtml(name)}</span>
          <strong>${qty}</strong>
        </div>
        <div class="pm-top-track">
          <div class="pm-top-fill" style="width:${Math.max(8, Math.round((qty / maxQty) * 100))}%"></div>
        </div>
      </div>
    `).join('');
  }

  function renderCharts(customerOrders) {
    const series = buildWeeklySeries(customerOrders);
    renderStatusChart(customerOrders);
    renderWeeklyBars(series);
    renderRevenueTrend(series);
    renderTopProducts(customerOrders);
  }

  function renderDashboard() {
    const allProducts = VV.getAllProducts();
    const customProducts = VV.getAdminProducts();
    const customerOrders = getOrders().filter(order => (order.role || 'customer') === 'customer');
    const customers = getRegisteredCustomers().slice().sort((a, b) => {
      const aTime = new Date(a.registeredAt || 0).getTime();
      const bTime = new Date(b.registeredAt || 0).getTime();
      return bTime - aTime;
    });

    document.getElementById('totalProducts').textContent = allProducts.length;
    document.getElementById('customProducts').textContent = customProducts.length;
    document.getElementById('totalOrders').textContent = customerOrders.length;
    document.getElementById('pendingOrders').textContent = customerOrders.filter(order => (order.status || 'Pending') === 'Pending').length;
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('lastSync').textContent = 'Updated ' + new Date().toLocaleTimeString();
    renderCharts(customerOrders);

    orderList.innerHTML = '';
    const recentOrders = customerOrders.slice(0, 5);
    if (!recentOrders.length) {
      orderList.innerHTML = '<div class="empty-note muted">No customer orders yet.</div>';
    } else {
      recentOrders.forEach(order => {
        const name = order.customer && order.customer.fullName ? order.customer.fullName : (order.username || 'Customer');
        const total = order.summary && order.summary.total ? VV.money(order.summary.total) : VV.money(0);
        const status = order.status || 'Pending';
        orderList.insertAdjacentHTML('beforeend', `
          <article class="activity-row">
            <div class="activity-top">
              <strong>Order ID: ${order.id || '-'}</strong>
              <span class="${statusClass(status)}">${status}</span>
            </div>
            <div class="muted">${name}</div>
            <div><strong>${total}</strong></div>
          </article>
        `);
      });
    }

    userList.innerHTML = '';
    const recentUsers = customers.slice(0, 6);
    if (!recentUsers.length) {
      userList.innerHTML = '<div class="empty-note muted">No customer registrations yet.</div>';
    } else {
      recentUsers.forEach(user => {
        const when = user.registeredAt ? new Date(user.registeredAt).toLocaleString() : '-';
        userList.insertAdjacentHTML('beforeend', `
          <article class="activity-row">
            <strong>${user.username || '-'}</strong>
            <div class="muted">${user.name || '-'}</div>
            <div class="muted">${user.email || '-'}</div>
            <div class="muted">${when}</div>
          </article>
        `);
      });
    }
  }

  renderDashboard();

  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === ORDERS_KEY || e.key === REG_USERS_KEY || e.key === ADMIN_PRODUCTS_KEY || e.key === REMOVED_BASE_KEY) {
      renderDashboard();
    }
  });

