  const AUTH_KEY = 'vv_auth';
  const PROFILE_KEY = 'vv_profile';
  const PROFILES_KEY = 'vv_profiles';
  const REG_USERS_KEY = 'vv_registered_users';
  const LAST_USER_KEY = 'vv_last_registered_user';
  const RESERVED_USERNAMES = new Set(['admin1', 'promanager']);

  const msgEl = document.getElementById('regMsg');
  const okEl = document.getElementById('regOk');

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

  async function tryBackendRegister(payload) {
    try {
      const res = await fetch('../backend/api.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      });
      const data = await res.json();
      if (!res.ok || !data || !data.ok) {
        return { ok: false, error: (data && data.error) ? data.error : 'Registration failed' };
      }
      return { ok: true, data };
    } catch (e) {
      return null;
    }
  }

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUser').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const confirmPassword = document.getElementById('regConfirm').value.trim();
    const usernameLower = username.toLowerCase();

    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      showError('Please fill all fields.');
      return;
    }
    if (RESERVED_USERNAMES.has(usernameLower)) {
      showError('This username is reserved. Please choose another username.');
      return;
    }
    if (getRegisteredUsers().some(user => (user.username || '').toLowerCase() === usernameLower)) {
      showError('Username already exists. Please choose another username.');
      return;
    }
    if (password.length < 3) {
      showError('Password must be at least 3 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Password and confirm password do not match.');
      return;
    }

    const backend = await tryBackendRegister({
      name,
      username,
      email,
      phone,
      password,
      role: 'customer'
    });

    if (!backend) {
      showError('Server unavailable. Please try again.');
      return;
    }

    if (!backend.ok) {
      showError(backend.error || 'Unable to register.');
      return;
    }

    const users = getRegisteredUsers();
    const incomingUser = (backend.data && backend.data.user && typeof backend.data.user === 'object')
      ? backend.data.user
      : {
          name,
          username,
          email,
          phone,
          password,
          role: 'customer',
          registeredAt: new Date().toISOString()
        };
    const incomingProfile = (backend.data && backend.data.profile && typeof backend.data.profile === 'object')
      ? backend.data.profile
      : {
          name,
          email,
          phone,
          address: '',
          city: '',
          zipCode: '',
          updatedAt: new Date().toISOString()
        };

    const existingIdx = users.findIndex(user => String(user.username || '').toLowerCase() === usernameLower);
    if (existingIdx >= 0) users[existingIdx] = { ...users[existingIdx], ...incomingUser };
    else users.push(incomingUser);
    localStorage.setItem(REG_USERS_KEY, JSON.stringify(users));

    const profiles = loadProfiles();
    profiles[usernameLower] = {
      ...(profiles[usernameLower] || {}),
      ...incomingProfile,
      updatedAt: new Date().toISOString()
    };
    saveProfiles(profiles);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles[usernameLower]));
    localStorage.setItem(LAST_USER_KEY, username);
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      role: 'customer',
      username,
      loggedInAt: new Date().toISOString()
    }));
    showSuccess('Registration successful. Redirecting to home...');

    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1200);
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

