(function () {
  var API_URL = "../backend/api.php";
  var REG_USERS_KEY = "vv_registered_users";
  var PROFILES_KEY = "vv_profiles";
  var ADMIN_PRODUCTS_KEY = "vv_admin_products";
  var REMOVED_BASE_KEY = "vv_removed_base_products";
  var ORDERS_KEY = "vv_orders";
  var ORDER_SEQ_KEY = "vv_order_seq";
  var CART_KEY = "vv_cart";
  var CART_MAP_KEY = "vv_cart_by_user";
  var CART_OWNER_KEY = "vv_cart_owner";
  var WISHLIST_KEY = "vv_wishlist_by_user";
  var AUTH_KEY = "vv_auth";
  var SYNC_STATE_KEYS = [
    REG_USERS_KEY,
    PROFILES_KEY,
    ADMIN_PRODUCTS_KEY,
    REMOVED_BASE_KEY,
    ORDERS_KEY,
    CART_MAP_KEY,
    WISHLIST_KEY
  ];
  var localSyncSuspended = false;
  var syncTimer = null;
  var retrySyncTimer = null;
  var syncInFlight = false;
  var syncQueued = false;

  function isObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function readArrayFromStorage(key) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function readObjectFromStorage(key) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "{}");
      return isObject(parsed) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function collectSyncState() {
    var state = {};
    if (localStorage.getItem(REG_USERS_KEY) !== null) state.registeredUsers = readArrayFromStorage(REG_USERS_KEY);
    if (localStorage.getItem(PROFILES_KEY) !== null) state.profiles = readObjectFromStorage(PROFILES_KEY);
    if (localStorage.getItem(ADMIN_PRODUCTS_KEY) !== null) state.adminProducts = readArrayFromStorage(ADMIN_PRODUCTS_KEY);
    if (localStorage.getItem(REMOVED_BASE_KEY) !== null) state.removedBaseProducts = readArrayFromStorage(REMOVED_BASE_KEY);
    if (localStorage.getItem(ORDERS_KEY) !== null) state.orders = readArrayFromStorage(ORDERS_KEY);
    if (localStorage.getItem(CART_MAP_KEY) !== null) state.cartMap = readObjectFromStorage(CART_MAP_KEY);
    if (localStorage.getItem(WISHLIST_KEY) !== null) state.wishlistMap = readObjectFromStorage(WISHLIST_KEY);
    return state;
  }

  function shouldAutoSyncKey(key) {
    return SYNC_STATE_KEYS.indexOf(String(key || "")) !== -1;
  }

  function shouldRefreshCartUIKey(key) {
    var normalized = String(key || "");
    return normalized === CART_KEY || normalized === CART_MAP_KEY || normalized === CART_OWNER_KEY;
  }

  function shouldRefreshWishlistUIKey(key) {
    var normalized = String(key || "");
    return normalized === WISHLIST_KEY || normalized === AUTH_KEY;
  }

  function refreshHeaderUI() {
    updateCartBadge();
    updateWishlistBadge();
    ensureRolePill();
    ensureRoleFooterText();
    ensureDashboardReturnIcon();
    ensureWishlistLink();
  }

  function applyBootstrapData(data) {
    if (!isObject(data)) return false;
    var changed = false;
    localSyncSuspended = true;
    try {
      if (Array.isArray(data.registeredUsers)) {
        localStorage.setItem(REG_USERS_KEY, JSON.stringify(data.registeredUsers));
        changed = true;
      }
      if (isObject(data.profiles)) {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(data.profiles));
        changed = true;
      }
      if (Array.isArray(data.adminProducts)) {
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(data.adminProducts));
        changed = true;
      }
      if (Array.isArray(data.removedBaseProducts)) {
        localStorage.setItem(REMOVED_BASE_KEY, JSON.stringify(data.removedBaseProducts));
        changed = true;
      }
      if (Array.isArray(data.orders)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
        changed = true;
      }
      if (isObject(data.cartMap)) {
        localStorage.setItem(CART_MAP_KEY, JSON.stringify(data.cartMap));
        changed = true;
      }
      if (typeof data.orderSeq === "number" && Number.isFinite(data.orderSeq)) {
        localStorage.setItem(ORDER_SEQ_KEY, String(Math.max(0, data.orderSeq)));
        changed = true;
      }
      if (isObject(data.wishlistMap)) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(data.wishlistMap));
        changed = true;
      }
    } finally {
      localSyncSuspended = false;
    }

    if (changed) {
      try {
        window.dispatchEvent(new CustomEvent("vv:bootstrap-synced"));
      } catch (e) {}
    }
    return changed;
  }

  function syncFromServerSync() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", API_URL + "?action=bootstrap", false);
      xhr.send(null);
      if (xhr.status < 200 || xhr.status >= 300) return false;
      var payload = JSON.parse(xhr.responseText || "{}");
      if (!payload || !payload.ok || !payload.data) return false;
      return applyBootstrapData(payload.data);
    } catch (e) {
      return false;
    }
  }

  function syncFromServerAsync() {
    return fetch(API_URL + "?action=bootstrap", { method: "GET" })
      .then(function (res) {
        if (!res.ok) throw new Error("bootstrap failed");
        return res.json();
      })
      .then(function (payload) {
        if (!payload || !payload.ok || !payload.data) return false;
        return applyBootstrapData(payload.data);
      })
      .catch(function () {
        return false;
      });
  }

  function postAction(action, body) {
    return fetch(API_URL + "?action=" + encodeURIComponent(action), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      });
    });
  }

  function flushAutoSync() {
    if (localSyncSuspended) return Promise.resolve(false);
    if (syncInFlight) {
      syncQueued = true;
      return Promise.resolve(false);
    }

    syncInFlight = true;
    if (retrySyncTimer) {
      clearTimeout(retrySyncTimer);
      retrySyncTimer = null;
    }

    return postAction("sync_state", collectSyncState())
      .then(function (res) {
        syncInFlight = false;
        if (!res || !res.ok || !res.data || !res.data.ok) {
          retrySyncTimer = setTimeout(function () {
            scheduleAutoSync(0);
          }, 1500);
          return false;
        }
        if (syncQueued) {
          syncQueued = false;
          scheduleAutoSync(120);
        }
        return true;
      })
      .catch(function () {
        syncInFlight = false;
        retrySyncTimer = setTimeout(function () {
          scheduleAutoSync(0);
        }, 1500);
        return false;
      });
  }

  function scheduleAutoSync(delay) {
    if (localSyncSuspended) return;
    var wait = typeof delay === "number" ? Math.max(0, delay) : 300;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      syncTimer = null;
      flushAutoSync();
    }, wait);
  }

  function installLocalStateWatchers() {
    if (!window.Storage || !Storage.prototype) return;
    if (Storage.prototype.__vvAutoSyncPatched) return;
    try {
      var nativeSet = Storage.prototype.setItem;
      var nativeRemove = Storage.prototype.removeItem;
      var nativeClear = Storage.prototype.clear;

      Storage.prototype.setItem = function (key, value) {
        nativeSet.call(this, key, value);
        if (this === localStorage) {
          if (shouldAutoSyncKey(key)) scheduleAutoSync(220);
          if (shouldRefreshCartUIKey(key)) updateCartBadge();
          if (shouldRefreshWishlistUIKey(key)) {
            updateWishlistBadge();
            ensureRolePill();
            ensureRoleFooterText();
            ensureDashboardReturnIcon();
            ensureWishlistLink();
          }
        }
      };

      Storage.prototype.removeItem = function (key) {
        nativeRemove.call(this, key);
        if (this === localStorage) {
          if (shouldAutoSyncKey(key)) scheduleAutoSync(220);
          if (shouldRefreshCartUIKey(key)) updateCartBadge();
          if (shouldRefreshWishlistUIKey(key)) {
            updateWishlistBadge();
            ensureRolePill();
            ensureRoleFooterText();
            ensureDashboardReturnIcon();
            ensureWishlistLink();
          }
        }
      };

      Storage.prototype.clear = function () {
        nativeClear.call(this);
        if (this === localStorage) {
          scheduleAutoSync(220);
          refreshHeaderUI();
        }
      };

      Storage.prototype.__vvAutoSyncPatched = true;
    } catch (e) {}
  }

  window.VVBackend = {
    syncFromServerSync: syncFromServerSync,
    syncFromServerAsync: syncFromServerAsync,
    syncStateNow: flushAutoSync,
    post: postAction,
    saveProfile: function (username, role, profile) {
      return postAction("save_profile", { username: username, role: role, profile: profile || {} });
    },
    addCustomer: function (payload) {
      return postAction("add_customer", payload || {});
    },
    addProduct: function (product) {
      return postAction("add_product", { product: product || {} });
    },
    removeProduct: function (id) {
      return postAction("remove_product", { id: id });
    },
    placeOrder: function (order) {
      return postAction("order", { order: order || {} });
    },
    updateOrderStatus: function (id, status) {
      return postAction("update_order_status", { id: id, status: status });
    },
    setWishlist: function (username, items) {
      return postAction("set_wishlist", { username: username, items: items || [] });
    },
    setCart: function (userKey, items) {
      return postAction("set_cart", { userKey: userKey, items: items || [] });
    },
    login: function (role, username, password) {
      return postAction("login", { role: role, username: username, password: password });
    },
    register: function (payload) {
      return postAction("register", payload || {});
    }
  };

  installLocalStateWatchers();

  // Keep local cache in sync with backend before page logic runs.
  syncFromServerSync();

  function updateCartBadge() {
    var cart = [];
    if (window.VV && typeof window.VV.getCart === "function") {
      try {
        cart = window.VV.getCart();
      } catch (e) {
        cart = [];
      }
    } else {
      try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      } catch (e) {
        cart = [];
      }
    }
    var count = cart.reduce(function (sum, item) {
      return sum + Number(item.qty || 0);
    }, 0);
    document.querySelectorAll('[aria-label="Cart"]').forEach(function (el) {
      if (count > 0) {
        el.classList.add("has-count");
        el.setAttribute("data-count", String(count > 99 ? "99+" : count));
        el.setAttribute("title", "Cart (" + count + ")");
      } else {
        el.classList.remove("has-count");
        el.removeAttribute("data-count");
        el.setAttribute("title", "Cart");
      }
    });
  }

  function updateWishlistBadge() {
    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }

    var key = "";
    if (!auth || !auth.username) {
      key = "guest:local";
    } else if (auth.role === "customer") {
      key = String(auth.username || "").toLowerCase().trim();
    }

    var count = 0;
    if (key) {
      try {
        var map = JSON.parse(localStorage.getItem("vv_wishlist_by_user") || "{}");
        var list = map && Array.isArray(map[key]) ? map[key] : [];
        count = Array.from(new Set(list.map(function (v) { return String(v); }).filter(Boolean))).length;
      } catch (e) {
        count = 0;
      }
    }

    document.querySelectorAll(".wishlist-icon").forEach(function (el) {
      if (count > 0) {
        el.classList.add("has-count");
        el.setAttribute("data-count", String(count > 99 ? "99+" : count));
        el.setAttribute("aria-label", "Wishlist, " + count + " items");
      } else {
        el.classList.remove("has-count");
        el.removeAttribute("data-count");
        el.setAttribute("aria-label", "Wishlist");
      }
    });
  }

  function highlightNav() {
    var current = location.pathname.split("/").pop() || "home.html";
    document.querySelectorAll(".nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      a.classList.toggle("active", href === current);
    });
  }

  function guardPages() {
    var current = location.pathname.split("/").pop() || "home.html";
    var publicPages = [
      "index.html",
      "home.html",
      "shop.html",
      "about.html",
      "contact.html",
      "product.html",
      "cart.html",
      "wishlist.html",
      "checkout.html",
      "login.html",
      "register.html"
    ];
    if (publicPages.indexOf(current) !== -1) return;
    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }
    if (!auth || !auth.username) {
      location.href = "login.html";
    }
  }

  function ensureLogoutLink() {
    var current = location.pathname.split("/").pop() || "home.html";
    if (current === "login.html" || current === "register.html") return;
    var navActions = document.querySelector(".nav-actions");
    if (!navActions) return;
    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }

    var existing = navActions.querySelector(".logout-btn");
    if (!auth || !auth.username) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    var btn = document.createElement("button");
    btn.className = "btn-outline logout-btn";
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", "Logout");
    btn.setAttribute("title", "Logout");
    btn.textContent = "Log out";
    navActions.appendChild(btn);
  }

  function roleLabel(role) {
    if (role === "admin") return "ADMIN";
    if (role === "productManager") return "MANAGER";
    if (role === "customer") return "USER";
    return "";
  }

  function ensureRolePill() {
    var current = location.pathname.split("/").pop() || "home.html";
    if (current === "login.html") return;

    var navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }
    var text = roleLabel(auth && auth.role ? auth.role : "");

    var pill = navActions.querySelector(".role-pill");
    if (!text) {
      if (pill) pill.remove();
      return;
    }
    if (!pill) {
      pill = document.createElement("span");
      pill.className = "role-pill";
      var logoutBtn = navActions.querySelector(".logout-btn");
      if (logoutBtn) navActions.insertBefore(pill, logoutBtn);
      else navActions.appendChild(pill);
    }
    pill.textContent = text;
    pill.setAttribute("title", text);
  }

  function ensureRoleFooterText() {
    var current = location.pathname.split("/").pop() || "home.html";
    if (current === "login.html") return;

    var roleFooterText = document.getElementById("roleFooterText");
    if (!roleFooterText) return;

    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }

    var text = roleLabel(auth && auth.role ? auth.role : "");
    roleFooterText.textContent = text || "-";
    roleFooterText.setAttribute("title", text || "");
  }

  function ensureDashboardReturnIcon() {
    var current = location.pathname.split("/").pop() || "home.html";
    var navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }

    var target = null;
    var label = "";
    if (auth && auth.role === "productManager") {
      target = "pm-dashboard.html";
      label = "Return to Manager Dashboard";
    } else if (auth && auth.role === "admin") {
      target = "admin-dashboard.html";
      label = "Return to Admin Dashboard";
    }

    var shouldShow = current === "home.html" && !!target;
    var link = navActions.querySelector(".return-dashboard-icon");

    if (!shouldShow) {
      if (link) link.remove();
      return;
    }

    if (!link) {
      link = document.createElement("a");
      link.className = "icon-link return-dashboard-icon";
      link.innerHTML = "&#8617;";
      var firstIcon = navActions.querySelector(".icon-link");
      if (firstIcon) navActions.insertBefore(link, firstIcon);
      else navActions.appendChild(link);
    }
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);
    link.setAttribute("href", target);
  }

  function ensureWishlistLink() {
    var current = location.pathname.split("/").pop() || "home.html";
    var navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    var blocked = [
      "login.html",
      "register.html",
      "admin-dashboard.html",
      "pm-dashboard.html",
      "pm-products.html",
      "pm-orders.html",
      "pm-users.html"
    ];

    var auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("vv_auth") || "");
    } catch (e) {
      auth = null;
    }

    var shouldShow = blocked.indexOf(current) === -1 && (!auth || !auth.username || auth.role === "customer");
    var link = navActions.querySelector(".wishlist-icon");

    if (!shouldShow) {
      if (link) link.remove();
      return;
    }

    if (!link) {
      link = document.createElement("a");
      link.className = "icon-link wishlist-icon";
      link.innerHTML = "&#9825;";
      link.setAttribute("aria-label", "Wishlist");
      var firstIcon = navActions.querySelector(".icon-link");
      if (firstIcon) navActions.insertBefore(link, firstIcon);
      else navActions.appendChild(link);
    }
    link.setAttribute("href", "wishlist.html");
    link.classList.toggle("active", current === "wishlist.html");
  }

  function bindLogout() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".logout-btn");
      if (!btn) return;
      e.preventDefault();
      localStorage.removeItem("vv_auth");
      localStorage.removeItem(CART_OWNER_KEY);
      localStorage.setItem(CART_KEY, "[]");
      location.href = "login.html";
    });
  }

  function animateAddToCartFeedback() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add], #addBtn, #addNow");
      if (!btn) return;

      btn.classList.remove("added-feedback");
      void btn.offsetWidth;
      btn.classList.add("added-feedback");

      var card = btn.closest(".product-card");
      if (!card) return;
      card.classList.remove("added");
      void card.offsetWidth;
      card.classList.add("added");
      setTimeout(function () {
        card.classList.remove("added");
      }, 430);
    });
  }

  function animateAllButtonClicks() {
    document.addEventListener("pointerdown", function (e) {
      var el = e.target.closest(".btn, .btn-outline, .chip, .filter-btn, .icon-link, button, .nav a, .quick-link, .tab");
      if (!el) return;
      // animation disabled per user preference
    });
  }

  function initScrollReveal() {
    var els = document.querySelectorAll(".js-reveal");
    // scroll reveal disabled; keep elements static
    els.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("page-ready");
    initScrollReveal();
    guardPages();
    ensureLogoutLink();
    ensureRolePill();
    ensureRoleFooterText();
    ensureDashboardReturnIcon();
    ensureWishlistLink();
    highlightNav();
    refreshHeaderUI();
    syncFromServerAsync().then(function () {
      refreshHeaderUI();
      scheduleAutoSync(600);
    });
    animateAddToCartFeedback();
    animateAllButtonClicks();
    bindLogout();
  });

  window.addEventListener("storage", function (e) {
    refreshHeaderUI();
    if (shouldAutoSyncKey(e && e.key)) scheduleAutoSync(220);
  });

  window.addEventListener("focus", function () {
    syncFromServerAsync().then(function () {
      refreshHeaderUI();
    });
  });

  window.addEventListener("vv:bootstrap-synced", function () {
    refreshHeaderUI();
  });
})();
