const PRODUCTS = [
  {
    id: 1,
    name: 'Diamond Pendant',
    price: 4999,
    desc: 'Elegant diamond pendant for special moments.',
    img: 'images/product 1.jpg',
    tags: ['pendant', 'diamond'],
    badge: 'Bestseller'
  },
  {
    id: 2,
    name: 'Diamond Swan Necklace',
    price: 3499,
    desc: 'Sleek and graceful neck chain perfect for every occasion.',
    img: 'images/product 2.jpg',
    tags: ['necklace', 'diamond'],
    badge: null
  },
  {
    id: 3,
    name: 'Heart × Bow Pendant',
    price: 5299,
    desc: 'A whimsical blend of romance and playfulness.',
    img: 'images/product 3.jpg',
    tags: ['pendant'],
    badge: 'New'
  },
  {
    id: 4,
    name: 'Butterfly Pendant',
    price: 2299,
    desc: 'Delicate butterfly pendant for effortless elegance.',
    img: 'images/product 4.jpg',
    tags: ['pendant'],
    badge: null
  },
  {
    id: 5,
    name: 'Sapphire Pendant',
    price: 5299,
    desc: 'Deep blue sapphire set in lustrous white gold.',
    img: 'images/product 5.jpg',
    tags: ['pendant', 'diamond'],
    badge: 'New'
  },
  {
    id: 6,
    name: 'Heart Diamond Pendant',
    price: 5299,
    desc: 'A heart of diamonds — wear your love every day.',
    img: 'images/product 6.jpg',
    tags: ['pendant', 'diamond'],
    badge: null
  },
  {
    id: 7,
    name: 'Classic Diamond Pendant',
    price: 7299,
    desc: 'Timeless solitaire diamond pendant, forever in style.',
    img: 'images/product 7.jpg',
    tags: ['pendant', 'diamond'],
    badge: 'Premium'
  },
  {
    id: 8,
    name: 'Bow Pendant',
    price: 2299,
    desc: 'Sweet bow pendant that adds a touch of charm.',
    img: 'images/product 8.jpg',
    tags: ['pendant'],
    badge: null
  },
  {
    id: 9,
    name: 'Layered Pendant',
    price: 3299,
    desc: 'Multi-layer pendant for a curated, stacked look.',
    img: 'images/product 9.jpg',
    tags: ['pendant', 'necklace'],
    badge: null
  },
  {
    id: 10,
    name: 'Marine Pendant',
    price: 2299,
    desc: 'Ocean-inspired pendant with a fluid, wave-like form.',
    img: 'images/product 10.jpg',
    tags: ['pendant'],
    badge: null
  }
];

let currentUser    = null;   
let cart           = [];    
let wishlist       = [];    
let currentFilter  = 'all';
let currentSearch  = '';

const store = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k)    => localStorage.removeItem(k)
};

const userKey = (suffix) => `zivara_${currentUser?.email || 'guest'}_${suffix}`;

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('fade-out');
  }, 1800);

  const saved = store.get('zivara_session');
  if (saved) {
    currentUser = saved;
    restoreUserData();
    updateAuthUI();
  }
  renderProducts(PRODUCTS);

  startHeroAutoplay();
  window.addEventListener('scroll', handleScroll);
  observeReveal();
});

function handleScroll() {
  const header = document.getElementById('main-header');
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

let slideIdx = 0;
let heroTimer = null;

function goToSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  slides[slideIdx].classList.remove('active');
  dots[slideIdx].classList.remove('active');
  slideIdx = (n + slides.length) % slides.length;
  slides[slideIdx].classList.add('active');
  dots[slideIdx].classList.add('active');
}
function nextSlide() { goToSlide(slideIdx + 1); resetAutoplay(); }
function prevSlide() { goToSlide(slideIdx - 1); resetAutoplay(); }
function startHeroAutoplay() { heroTimer = setInterval(() => goToSlide(slideIdx + 1), 5000); }
function resetAutoplay()     { clearInterval(heroTimer); startHeroAutoplay(); }

function openAuth()  { document.getElementById('auth-overlay').classList.remove('hidden'); }
function closeAuth() { document.getElementById('auth-overlay').classList.add('hidden'); }

function authButtonClicked() {
  if (currentUser) openProfile();
  else openAuth();
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
  });
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
  clearAuthErrors();
}

function clearAuthErrors() {
  ['login-error', 'signup-error'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.classList.add('hidden');
  });
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

function handleSignup() {
  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;

  if (!name)              return showAuthError('signup-error', 'Please enter your name.');
  if (!email.includes('@')) return showAuthError('signup-error', 'Please enter a valid email.');
  if (password.length < 6) return showAuthError('signup-error', 'Password must be at least 6 characters.');

  const users = store.get('zivara_users') || {};
  if (users[email]) return showAuthError('signup-error', 'An account with this email already exists.');

  const user = { name, email, password };
  users[email] = user;
  store.set('zivara_users', users);

  loginAs(user);
  closeAuth();
  showToast(`Welcome to Zivara, ${name}! 💎`);
}

function handleLogin() {
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) return showAuthError('login-error', 'Please fill in all fields.');

  const users = store.get('zivara_users') || {};
  const user  = users[email];

  if (!user)                   return showAuthError('login-error', 'No account found with this email.');
  if (user.password !== password) return showAuthError('login-error', 'Incorrect password.');

  loginAs(user);
  closeAuth();
  showToast(`Welcome back, ${user.name}!`);
}

function loginAs(user) {
  currentUser = user;
  store.set('zivara_session', user);
  restoreUserData();
  updateAuthUI();
}

function handleLogout() {
  saveUserData();
  currentUser = null;
  cart       = [];
  wishlist   = [];
  store.remove('zivara_session');
  updateAuthUI();
  updateCartUI();
  updateWishlistUI();
  updateProductCards();
  closeProfile();
  showToast('You\'ve been signed out.');
}

function restoreUserData() {
  cart     = store.get(userKey('cart'))     || [];
  wishlist = store.get(userKey('wishlist')) || [];
  updateCartUI();
  updateWishlistUI();
  updateProductCards();
}

function saveUserData() {
  if (!currentUser) return;
  store.set(userKey('cart'),     cart);
  store.set(userKey('wishlist'), wishlist);
}

function updateAuthUI() {
  const icon = document.getElementById('auth-icon');
  if (currentUser) {
    icon.textContent = currentUser.name.charAt(0).toUpperCase();
    icon.style.cssText = `
      width:30px; height:30px; border-radius:50%;
      background:linear-gradient(135deg,#a07840,#c9a96e);
      color:white; display:flex; align-items:center; justify-content:center;
      font-family:var(--font-display); font-size:0.9rem; font-weight:600;
    `;
  } else {
    icon.textContent = '👤';
    icon.style.cssText = '';
  }
}
function openProfile() {
  if (!currentUser) return openAuth();
  document.getElementById('profile-avatar-letter').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('profile-name').textContent  = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;
  renderOrders();
  document.getElementById('profile-overlay').classList.remove('hidden');
}
function closeProfile() { document.getElementById('profile-overlay').classList.add('hidden'); }

function switchProfileTab(tab) {
  document.querySelectorAll('.profile-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'account') || (i === 1 && tab === 'orders'));
  });
  document.getElementById('account-tab').classList.toggle('hidden', tab !== 'account');
  document.getElementById('orders-tab').classList.toggle('hidden', tab !== 'orders');
}

function renderOrders() {
  const orders = store.get(userKey('orders')) || [];
  const container = document.getElementById('orders-list');
  if (!orders.length) {
    container.innerHTML = '<p class="no-orders">No orders yet. Start shopping! 💎</p>';
    return;
  }
  container.innerHTML = orders.slice().reverse().map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <span class="order-id">Order #${order.id}</span>
        <span class="order-status">Delivered</span>
      </div>
      <p class="order-date" style="font-size:0.73rem;color:var(--muted);margin-bottom:10px;">${order.date}</p>
      ${order.items.map(item => `
        <p class="order-item-name">${item.name} × ${item.qty}</p>
        <p class="order-item-price">${formatPrice(item.price * item.qty)}</p>
      `).join('')}
      <p class="order-total">Total: ${formatPrice(order.total)}</p>
    </div>
  `).join('');
}

function openCart() {
  updateCartDrawer();
  document.getElementById('cart-overlay').classList.remove('hidden');
}
function closeCart() { document.getElementById('cart-overlay').classList.add('hidden'); }
function closeCartIfOutside(e) {
  if (e.target === document.getElementById('cart-overlay')) closeCart();
}

function addToCart(productId) {
  if (!currentUser) {
    openAuth();
    showToast('Please sign in to add items to your cart.');
    return;
  }
  const idx = cart.findIndex(c => c.productId === productId);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ productId, qty: 1 });
  }
  saveUserData();
  updateCartUI();
  updateCartDrawer();
  const product = PRODUCTS.find(p => p.id === productId);
  showToast(`${product.name} added to cart! 🛍`);

  const btn = document.querySelector(`[data-cart-id="${productId}"]`);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }, 1500);
  }
}

function removeFromCart(productId) {
  cart = cart.filter(c => c.productId !== productId);
  saveUserData();
  updateCartUI();
  updateCartDrawer();
}

function changeQty(productId, delta) {
  const idx = cart.findIndex(c => c.productId === productId);
  if (idx < 0) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  saveUserData();
  updateCartUI();
  updateCartDrawer();
}

function updateCartUI() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

function updateCartDrawer() {
  const container = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  const empty     = document.getElementById('cart-empty');
  const badge     = document.getElementById('cart-badge');

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  badge.textContent = totalQty;

  if (!cart.length) {
    container.innerHTML = '';
    footer.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  footer.classList.remove('hidden');

  let total = 0;
  container.innerHTML = cart.map(({ productId, qty }) => {
    const p = PRODUCTS.find(pr => pr.id === productId);
    if (!p) return '';
    total += p.price * qty;
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${p.img}" alt="${p.name}" onerror="this.parentElement.textContent='💎'"/>
        </div>
        <div class="cart-item-info">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${formatPrice(p.price)}</p>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, +1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})">✕</button>
      </div>
    `;
  }).join('');

  document.getElementById('cart-total').textContent = formatPrice(total);
}

function checkout() {
  if (!cart.length) return;
  const orders = store.get(userKey('orders')) || [];
  const items  = cart.map(({ productId, qty }) => {
    const p = PRODUCTS.find(pr => pr.id === productId);
    return { name: p.name, price: p.price, qty };
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id:    Date.now(),
    date:  new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' }),
    items, total
  };
  orders.push(order);
  store.set(userKey('orders'), orders);

  cart = [];
  saveUserData();
  updateCartUI();
  updateCartDrawer();
  closeCart();
  showToast('Order placed successfully! 🎉');
}

function openWishlist() {
  updateWishlistDrawer();
  document.getElementById('wishlist-overlay').classList.remove('hidden');
}
function closeWishlist() { document.getElementById('wishlist-overlay').classList.add('hidden'); }
function closeWishlistIfOutside(e) {
  if (e.target === document.getElementById('wishlist-overlay')) closeWishlist();
}

function toggleWishlist(productId) {
  if (!currentUser) {
    openAuth();
    showToast('Please sign in to save to wishlist.');
    return;
  }
  const idx = wishlist.indexOf(productId);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist.');
  } else {
    wishlist.push(productId);
    showToast('Saved to wishlist! 🤍');
  }
  saveUserData();
  updateWishlistUI();
  updateWishlistDrawer();

  const btn = document.querySelector(`[data-wish-id="${productId}"]`);
  if (btn) {
    btn.textContent = wishlist.includes(productId) ? '❤' : '♡';
    btn.classList.toggle('active', wishlist.includes(productId));
  }
}

function updateWishlistUI() {
  document.getElementById('wishlist-count').textContent = wishlist.length;
}

function updateWishlistDrawer() {
  const container = document.getElementById('wishlist-items');
  const empty     = document.getElementById('wishlist-empty');
  const badge     = document.getElementById('wishlist-badge');

  badge.textContent = wishlist.length;

  if (!wishlist.length) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = wishlist.map(productId => {
    const p = PRODUCTS.find(pr => pr.id === productId);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${p.img}" alt="${p.name}" onerror="this.parentElement.textContent='💎'"/>
        </div>
        <div class="cart-item-info">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${formatPrice(p.price)}</p>
          <button class="btn-cart" style="margin-top:8px;padding:7px 14px;font-size:0.75rem;" onclick="addToCart(${p.id}); closeWishlist()">Add to Cart</button>
        </div>
        <button class="cart-item-remove" onclick="toggleWishlist(${p.id})">✕</button>
      </div>
    `;
  }).join('');
}

function updateProductCards() {
  PRODUCTS.forEach(p => {
    const btn = document.querySelector(`[data-wish-id="${p.id}"]`);
    if (btn) {
      const inWish = wishlist.includes(p.id);
      btn.textContent = inWish ? '❤' : '♡';
      btn.classList.toggle('active', inWish);
    }
  });
}

function renderProducts(list) {
  const grid = document.getElementById('products-grid');
  const noRes = document.getElementById('no-results');

  if (!list.length) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }

  noRes.classList.add('hidden');
  grid.innerHTML = list.map((p, i) => {
    const inWish = wishlist.includes(p.id);
    const tagLabel = p.tags[0].charAt(0).toUpperCase() + p.tags[0].slice(1);
    return `
      <div class="product-card reveal" style="animation-delay:${i * 60}ms">
        <div class="card-img-wrap">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><rect fill=%22%23f8f4ee%22 width=%22200%22 height=%22200%22/><text x=%22100%22 y=%22110%22 text-anchor=%22middle%22 font-size=%2260%22>💎</text></svg>'"/>
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          <button class="wishlist-toggle ${inWish ? 'active' : ''}"
            data-wish-id="${p.id}"
            onclick="toggleWishlist(${p.id})"
            title="${inWish ? 'Remove from wishlist' : 'Save to wishlist'}">
            ${inWish ? '❤' : '♡'}
          </button>
        </div>
        <div class="card-body">
          <p class="card-tag">${tagLabel}</p>
          <h3 class="card-name">${p.name}</h3>
          <p class="card-desc">${p.desc}</p>
          <p class="card-price">${formatPrice(p.price)}</p>
          <div class="card-actions">
            <button class="btn-cart" data-cart-id="${p.id}" onclick="addToCart(${p.id})">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(observeReveal, 50);
}

function filterByTag(tag, el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentFilter = tag;
  applyFilters();
}

function filterProducts() {
  currentSearch = document.getElementById('search-input').value.toLowerCase().trim();
  applyFilters();
}

function applyFilters() {
  let list = PRODUCTS;

  if (currentFilter === 'under3000') {
    list = list.filter(p => p.price < 3000);
  } else if (currentFilter !== 'all') {
    list = list.filter(p => p.tags.includes(currentFilter));
  }

  if (currentSearch) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.desc.toLowerCase().includes(currentSearch) ||
      p.tags.some(t => t.includes(currentSearch))
    );
  }

  renderProducts(list);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  currentSearch = '';
  currentFilter = 'all';
  document.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  renderProducts(PRODUCTS);
}

function toggleMobileMenu() {
  document.getElementById('mobile-nav').classList.toggle('hidden');
}
function closeMobileMenu() {
  document.getElementById('mobile-nav').classList.add('hidden');
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2800);
}

function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

document.addEventListener('click', (e) => {
  const overlay = document.getElementById('profile-overlay');
  if (!overlay.classList.contains('hidden') && e.target === overlay) closeProfile();
  const authOverlay = document.getElementById('auth-overlay');
  if (!authOverlay.classList.contains('hidden') && e.target === authOverlay) closeAuth();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeAuth();
  closeCart();
  closeWishlist();
  closeProfile();
});