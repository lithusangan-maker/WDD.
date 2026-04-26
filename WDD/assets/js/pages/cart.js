const AUTH_KEY = 'vv_auth';
const CART_KEY = 'vv_cart';
const CART_MAP_KEY = 'vv_cart_by_user';
const ADMIN_PRODUCTS_KEY = 'vv_admin_products';
const REMOVED_BASE_KEY = 'vv_removed_base_products';
const rows = document.getElementById('rows');

function render() {
  const cart = VV.getCart();
  const validCart = cart.filter(item => !!VV.getProductById(item.productId));
  if (validCart.length !== cart.length) {
    VV.saveCart(validCart);
  }
  rows.innerHTML = '';

  if (!validCart.length) {
    rows.innerHTML = '<div style="padding:14px" class="muted">Your cart is empty. <a href="shop.html">Continue shopping</a>.</div>';
    updateTotals(0);
    return;
  }

  let subtotal = 0;
  validCart.forEach(item => {
    const p = VV.getProductById(item.productId);
    if (!p) return;
    const brand = VV.getProductBrand ? VV.getProductBrand(p) : (p.brand || VV.DEFAULT_BRAND || 'Velvet Vogue');
    const line = p.price * item.qty;
    subtotal += line;

    rows.insertAdjacentHTML('beforeend', `
      <div class="table-row">
        <div class="product-cell">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='../assets/images/product-fallback.svg';">
          <div>
            <div class="muted">${brand}</div>
            <div class="product-name">${p.name}</div>
            <div class="muted">${item.size || '-'} - ${item.color || '-'}</div>
            <button class="btn-outline" data-remove="${item.key}">Remove</button>
          </div>
        </div>
        <div>${VV.money(p.price)}</div>
        <div>
          <div class="qty">
            <button class="btn-outline" data-minus="${item.key}">-</button>
            <span>${item.qty}</span>
            <button class="btn-outline" data-plus="${item.key}">+</button>
          </div>
        </div>
        <div>${VV.money(line)}</div>
      </div>
    `);
  });

  rows.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => { VV.removeItem(b.dataset.remove); render(); });
  rows.querySelectorAll('[data-minus]').forEach(b => b.onclick = () => {
    const it = VV.getCart().find(x => x.key === b.dataset.minus); if (!it) return;
    VV.updateQty(it.key, it.qty - 1); render();
  });
  rows.querySelectorAll('[data-plus]').forEach(b => b.onclick = () => {
    const it = VV.getCart().find(x => x.key === b.dataset.plus); if (!it) return;
    VV.updateQty(it.key, it.qty + 1); render();
  });

  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const shipping = subtotal > 0 ? Number((subtotal * 0.2).toFixed(2)) : 0;
  document.getElementById('subtotal').textContent = VV.money(subtotal);
  document.getElementById('shipping').textContent = VV.money(shipping);
  document.getElementById('grand').textContent = VV.money(subtotal + shipping);
}

document.getElementById('clear').onclick = () => { VV.clearCart(); render(); };
render();

window.addEventListener('storage', (e) => {
  if (!e.key) return;
  if (e.key === CART_KEY || e.key === CART_MAP_KEY || e.key === AUTH_KEY || e.key === ADMIN_PRODUCTS_KEY || e.key === REMOVED_BASE_KEY) {
    render();
  }
});
