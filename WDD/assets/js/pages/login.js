  const AUTH_KEY = 'vv_auth';
  const REG_USERS_KEY = 'vv_registered_users';
  const LAST_USER_KEY = 'vv_last_registered_user';
  const PROFILE_KEY = 'vv_profile';
  const PROFILES_KEY = 'vv_profiles';
  const ROLE_DEFAULT_PROFILES = {
    admin: {
      name: 'Admin',
      email: 'admin@velvetvogue.com',
      phone: '011-000-0001',
      address: 'Velvet Vogue Head Office',
      city: 'Colombo',
      zipCode: '00100'
    },
    productManager: {
      name: 'Product Manager',
      email: 'manager@velvetvogue.com',
      phone: '011-000-0002',
      address: 'Velvet Vogue Operations',
      city: 'Colombo',
      zipCode: '00200'
    }
  };
  const tabs = Array.from(document.querySelectorAll('.auth-tab'));
  const panels = {
    admin: document.getElementById('adminForm'),
    productManager: document.getElementById('productManagerForm'),
    customer: document.getElementById('customerForm')
  };

  const msgEl = document.getElementById('authMsg');
  const okEl = document.getElementById('authOk');
  const popup = document.getElementById('loginPopup');
  const popupOk = document.getElementById('popupOk');

  function getRegisteredUsers() {
    try { return JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]'); } catch (e) { return []; }
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

  function ensureRoleProfile(role, username) {
    if (role !== 'admin' && role !== 'productManager') return null;
    const key = String(username || '').toLowerCase();
    if (!key) return null;

    const defaults = ROLE_DEFAULT_PROFILES[role] || {};
    const profiles = loadProfiles();
    const existing = profiles[key] && typeof profiles[key] === 'object' ? profiles[key] : {};
    const nextProfile = {
      ...defaults,
      ...existing,
      name: existing.name || defaults.name || username,
      role,
      updatedAt: new Date().toISOString()
    };
    profiles[key] = nextProfile;
    saveProfiles(profiles);
    return nextProfile;
  }

  function showError(text) {
    okEl.style.display = 'none';
    msgEl.textContent = text;
    msgEl.style.display = 'block';
  }

  function showSuccess(text) {
    msgEl.style.display = 'none';
    okEl.textContent = text;
    okEl.style.display = 'block';
  }

  function showLoginPopup() {
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
  }

  async function tryBackendLogin(role, username, password) {
    try {
      const res = await fetch('../backend/api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password })
      });
      const data = await res.json();
      if (!res.ok || !data || !data.ok) {
        return {
          ok: false,
          error: (data && data.error) ? data.error : 'Invalid credentials.',
          offline: false
        };
      }
      return { ok: true, data };
    } catch (e) {
      return {
        ok: false,
        error: 'Server unavailable. Please try again.',
        offline: true
      };
    }
  }

  popupOk.addEventListener('click', () => {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '');
      if (auth && auth.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
        return;
      }
      if (auth && auth.role === 'productManager') {
        window.location.href = 'pm-dashboard.html';
        return;
      }
    } catch (e) {}
    window.location.href = 'home.html';
  });

  function setActive(role) {
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.role === role));
    Object.keys(panels).forEach(key => panels[key].classList.toggle('active', key === role));
    msgEl.style.display = 'none';
    okEl.style.display = 'none';
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setActive(tab.dataset.role)));

  async function handleLogin(role, username, password) {
    if (!username || !password) {
      showError('Please enter username and password.');
      return;
    }

    const backend = await tryBackendLogin(role, username, password);
    if (backend && backend.ok && backend.data && backend.data.auth) {
      const payload = backend.data;
      const authPayload = {
        role: payload.auth.role || role,
        username: payload.auth.username || username,
        loggedInAt: payload.auth.loggedInAt || new Date().toISOString()
      };

      const profiles = loadProfiles();
      const profileKey = String(authPayload.username || '').toLowerCase();
      if (payload.profile && profileKey) {
        profiles[profileKey] = {
          ...(profiles[profileKey] || {}),
          ...payload.profile,
          updatedAt: new Date().toISOString()
        };
        saveProfiles(profiles);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles[profileKey]));
      } else {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({}));
      }

      if (authPayload.role === 'customer' && payload.user && payload.user.username) {
        const users = getRegisteredUsers();
        const key = String(payload.user.username).toLowerCase();
        const idx = users.findIndex(user => String(user.username || '').toLowerCase() === key);
        if (idx >= 0) users[idx] = { ...users[idx], ...payload.user };
        else users.push(payload.user);
        localStorage.setItem(REG_USERS_KEY, JSON.stringify(users));
      }

      localStorage.setItem(AUTH_KEY, JSON.stringify(authPayload));
      showSuccess('Login Success');
      showLoginPopup();
      return;
    }

    showError((backend && backend.error) ? backend.error : 'Login failed.');
  }

  document.getElementById('adminForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin('admin', document.getElementById('adminUser').value.trim(), document.getElementById('adminPass').value.trim());
  });

  document.getElementById('customerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin('customer', document.getElementById('customerUser').value.trim(), document.getElementById('customerPass').value.trim());
  });

  document.getElementById('productManagerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin('productManager', document.getElementById('productManagerUser').value.trim(), document.getElementById('productManagerPass').value.trim());
  });

  function syncToggleState(input, btn) {
    btn.classList.toggle('visible', input.value.length > 0);
    btn.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
  }

  document.querySelectorAll('.pass-toggle').forEach(btn => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    syncToggleState(input, btn);
    input.addEventListener('input', () => syncToggleState(input, btn));
    btn.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      syncToggleState(input, btn);
    });
  });

  const lastRegisteredUser = localStorage.getItem(LAST_USER_KEY);
  if (lastRegisteredUser) {
    const customerUserInput = document.getElementById('customerUser');
    if (customerUserInput) customerUserInput.value = lastRegisteredUser;
  }

