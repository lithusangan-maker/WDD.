  const AUTH_KEY = 'vv_auth';
  const REG_USERS_KEY = 'vv_registered_users';
  const PROFILES_KEY = 'vv_profiles';
  const LAST_USER_KEY = 'vv_last_registered_user';
  const RESERVED_USERNAMES = new Set(['admin1', 'promanager']);

  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || ''); } catch (e) { return null; }
  }

  function getRegisteredUsers() {
    try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(REG_USERS_KEY, JSON.stringify(users));
  }

  function getRegisteredCustomers() {
    const users = getRegisteredUsers();
    return users
      .filter(user => (user.role || 'customer') === 'customer')
      .sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime());
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const auth = loadAuth();
  if (!auth) {
    window.location.href = 'login.html';
  } else if (auth.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (auth.role !== 'productManager') {
    window.location.href = 'home.html';
  }

  const userTable = document.getElementById('userTable');
  const profileView = document.getElementById('profileView');
  const addCustomerForm = document.getElementById('addCustomerForm');
  const msgOk = document.getElementById('msgOk');
  const msgErr = document.getElementById('msgErr');
  let selectedUsername = '';

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

  function isToday(iso) {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  function isThisWeek(iso) {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - diff);
    return d >= start;
  }

  function getProfilesMap() {
    try {
      const raw = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) {
      return {};
    }
  }

  function saveProfilesMap(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles || {}));
  }

  function syncCustomerProfiles(customers) {
    const list = Array.isArray(customers) ? customers : [];
    const profiles = getProfilesMap();
    let changed = false;

    list.forEach(user => {
      const key = String(user && user.username ? user.username : '').toLowerCase();
      if (!key) return;

      const current = profiles[key] && typeof profiles[key] === 'object' ? profiles[key] : {};
      const next = {
        ...current,
        role: 'customer',
        name: String(current.name || user.name || user.username || ''),
        email: String(current.email || user.email || ''),
        phone: String(current.phone || user.phone || ''),
        address: String(current.address || user.address || ''),
        city: String(current.city || user.city || ''),
        zipCode: String(current.zipCode || user.zipCode || '')
      };

      if (JSON.stringify(current) !== JSON.stringify(next)) {
        profiles[key] = { ...next, updatedAt: new Date().toISOString() };
        changed = true;
      }
    });

    if (changed) saveProfilesMap(profiles);
    return profiles;
  }

  function formatDate(iso) {
    return iso ? new Date(iso).toLocaleString() : '-';
  }

  function getCustomerProfile(user) {
    const username = String(user && user.username ? user.username : '');
    const profile = getProfilesMap()[username.toLowerCase()] || {};
    return {
      username,
      name: String(profile.name || user.name || username || '-'),
      email: String(profile.email || user.email || '-'),
      phone: String(profile.phone || user.phone || '-'),
      address: String(profile.address || user.address || '-'),
      city: String(profile.city || user.city || '-'),
      zipCode: String(profile.zipCode || user.zipCode || '-'),
      registeredAt: String(user.registeredAt || ''),
      addedBy: String(user.addedBy || 'self')
    };
  }

  function renderProfile(user) {
    if (!user) {
      profileView.className = 'profile-view empty muted';
      profileView.textContent = 'Click any customer row to view full profile.';
      return;
    }

    const p = getCustomerProfile(user);
    profileView.className = 'profile-view';
    profileView.innerHTML = `
      <h3>${escapeHtml(p.name)}</h3>
      <div class="profile-grid">
        <div class="profile-row"><p class="muted">Username</p><strong>${escapeHtml(p.username || '-')}</strong></div>
        <div class="profile-row"><p class="muted">Email</p><strong>${escapeHtml(p.email || '-')}</strong></div>
        <div class="profile-row"><p class="muted">Phone</p><strong>${escapeHtml(p.phone || '-')}</strong></div>
        <div class="profile-row"><p class="muted">Address</p><strong>${escapeHtml(p.address || '-')}</strong></div>
        <div class="profile-row"><p class="muted">City</p><strong>${escapeHtml(p.city || '-')}</strong></div>
        <div class="profile-row"><p class="muted">Zip Code</p><strong>${escapeHtml(p.zipCode || '-')}</strong></div>
        <div class="profile-row"><p class="muted">Registered At</p><strong>${escapeHtml(formatDate(p.registeredAt))}</strong></div>
        <div class="profile-row"><p class="muted">Added By</p><strong>${escapeHtml(p.addedBy)}</strong></div>
      </div>
    `;
  }

  function renderUsers() {
    const customers = getRegisteredCustomers();
    syncCustomerProfiles(customers);

    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('todayCustomers').textContent = customers.filter(c => isToday(c.registeredAt)).length;
    document.getElementById('weekCustomers').textContent = customers.filter(c => isThisWeek(c.registeredAt)).length;
    document.getElementById('phoneCustomers').textContent = customers.filter(c => (c.phone || '').trim()).length;

    userTable.innerHTML = `
      <div class="user-row user-head">
        <div>Username</div><div>Name / Email</div><div>Phone</div><div>Registered At</div>
      </div>
    `;

    if (!customers.length) {
      userTable.insertAdjacentHTML('beforeend', '<div class="empty-note muted">No customer registrations yet.</div>');
      selectedUsername = '';
      renderProfile(null);
      return;
    }

    customers.forEach(user => {
      const dateText = user.registeredAt ? new Date(user.registeredAt).toLocaleString() : '-';
      userTable.insertAdjacentHTML('beforeend', `
        <article class="user-row clickable" data-username="${escapeHtml(user.username || '')}">
          <div><strong>${escapeHtml(user.username || '-')}</strong></div>
          <div><div>${escapeHtml(user.name || '-')}</div><div class="muted">${escapeHtml(user.email || '-')}</div></div>
          <div>${escapeHtml(user.phone || '-')}</div>
          <div>${escapeHtml(dateText)}</div>
        </article>
      `);
    });

    const rowMap = new Map(customers.map(user => [String(user.username || '').toLowerCase(), user]));
    userTable.querySelectorAll('.user-row.clickable').forEach(row => {
      const key = String(row.dataset.username || '').toLowerCase();
      if (key && key === selectedUsername) row.classList.add('selected');
      row.addEventListener('click', () => {
        selectedUsername = key;
        userTable.querySelectorAll('.user-row.clickable').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        renderProfile(rowMap.get(key) || null);
      });
    });

    if (selectedUsername) {
      renderProfile(rowMap.get(selectedUsername) || null);
      if (!rowMap.has(selectedUsername)) selectedUsername = '';
    }
    if (!selectedUsername) renderProfile(null);
  }

  addCustomerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('customerName').value.trim();
    const username = document.getElementById('customerUsername').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const password = document.getElementById('customerPassword').value.trim();
    const confirmPassword = document.getElementById('customerConfirmPassword').value.trim();
    const usernameLower = username.toLowerCase();

    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      showErr('Please fill all fields.');
      return;
    }
    if (RESERVED_USERNAMES.has(usernameLower)) {
      showErr('This username is reserved. Please choose another username.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('Please enter a valid email address.');
      return;
    }
    if (password.length < 3) {
      showErr('Password must be at least 3 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showErr('Password and confirm password do not match.');
      return;
    }

    const users = getRegisteredUsers();
    if (users.some(user => String(user.username || '').toLowerCase() === usernameLower)) {
      showErr('Username already exists. Please choose another username.');
      return;
    }

    let savedUser = {
      name,
      username,
      email,
      phone,
      password,
      role: 'customer',
      registeredAt: new Date().toISOString(),
      addedBy: auth.username || 'promanager'
    };
    let savedProfile = null;

    if (!window.VVBackend || typeof window.VVBackend.addCustomer !== 'function') {
      showErr('Backend unavailable. Please refresh and try again.');
      return;
    }
    try {
      const result = await window.VVBackend.addCustomer(savedUser);
      if (!result || !result.ok || !result.data || !result.data.ok) {
        showErr((result && result.data && result.data.error) ? result.data.error : 'Unable to add customer.');
        return;
      }
      if (result.data.user && typeof result.data.user === 'object') savedUser = result.data.user;
      if (result.data.profile && typeof result.data.profile === 'object') savedProfile = result.data.profile;
    } catch (err) {
      showErr('Server unavailable. Please try again.');
      return;
    }

    users.push(savedUser);
    saveRegisteredUsers(users);
    if (savedProfile) {
      const profiles = getProfilesMap();
      profiles[usernameLower] = {
        ...(profiles[usernameLower] || {}),
        ...savedProfile,
        updatedAt: new Date().toISOString()
      };
      saveProfilesMap(profiles);
    }
    if (window.VVBackend && typeof window.VVBackend.syncFromServerAsync === 'function') {
      window.VVBackend.syncFromServerAsync();
    }
    localStorage.setItem(LAST_USER_KEY, username);
    addCustomerForm.reset();
    showOk('Customer added successfully.');
    renderUsers();
  });

  renderUsers();

  window.addEventListener('storage', (e) => {
    if (e.key === REG_USERS_KEY || e.key === PROFILES_KEY) renderUsers();
  });

