// ============================================================
// ZYRA — script.js  (shared by index.html)
// ============================================================

const CART_KEY = 'zyracart';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzqFK-MNmEC_-5LAay-4GKiA6OE2aYFrRhik2JddiyVBK-aFPh6qq8lzOxa8z-TRdb/exec';

// --- 1. CART HELPERS (always read fresh from localStorage) ---
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// --- 2. INITIALIZE PAGE ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  revealSections();
  spawnBubbles();
});

// --- 3. SCROLL REVEAL & PROGRESS BAR ---
window.addEventListener('scroll', revealSections);

function revealSections() {
  document.querySelectorAll('section').forEach(sec => {
    if (sec.getBoundingClientRect().top < window.innerHeight - 100) {
      sec.style.opacity  = '1';
      sec.style.transform = 'translateY(0)';
    }
  });
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  document.getElementById('progress').style.width = ((winScroll / height) * 100) + '%';
}

// --- 4. LOADER ---
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);
    }, 1500);
  }
});

// --- 5. BUBBLES ---
function spawnBubbles() {
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    b.style.left     = Math.random() * 100 + 'vw';
    b.style.width    = b.style.height = (10 + Math.random() * 20) + 'px';
    b.style.animationDuration = (6 + Math.random() * 10) + 's';
    b.style.animationDelay   = (Math.random() * 8) + 's';
    document.body.appendChild(b);
  }
}

// --- 6. ADD TO CART ---
function addToCart(productName, price) {
  const cart = getCart();
  const existing = cart.find(i => i.name === productName);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name: productName, price: price, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showToast('🛍️ ' + productName + ' added to bag!');
}

function updateCartCount() {
  const count = getCart().reduce((t, i) => t + i.quantity, 0);
  const el = document.getElementById('cart-count');
  if (el) el.innerText = count;
}

// --- 7. TOAST ---
function showToast(msg) {
  const old = document.querySelector('.toast-notification');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast-notification';
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// --- 8. UI HELPERS ---
function toggleMode() {
  document.body.classList.toggle('dark-mode');
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Login modal (kept for backward compat — not needed if using login.html)
function openLogin()  { const m = document.getElementById('loginModal'); if (m) m.style.display = 'flex'; }
function closeLogin() { const m = document.getElementById('loginModal'); if (m) m.style.display = 'none'; }

function loginUser(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const users    = JSON.parse(localStorage.getItem('zyra_users')) || [];
  const found    = users.find(u => u.email === email && u.password === password);
  if (found) {
    localStorage.setItem('currentUser', JSON.stringify(found));
    closeLogin();
    updateCartCount();
    document.getElementById('loginMsg').innerText = '';
  } else {
    document.getElementById('loginMsg').innerText = 'Invalid email or password.';
  }
}

// --- 9. GOOGLE SHEETS — GIFT CARD ---
async function submitGiftCard(e) {
  e.preventDefault();
  const btn = document.getElementById('gcBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  document.getElementById('gcSuccess').style.display = 'none';
  document.getElementById('gcError').style.display   = 'none';

  const params = new URLSearchParams();
  params.append('formType',     'giftcard');
  params.append('senderName',   document.getElementById('gcsenderName').value.trim());
  params.append('receiverName', document.getElementById('gcreceiverName').value.trim());
  params.append('senderPhone',  document.getElementById('gcsenderPhone').value.trim());
  params.append('receiverPhone',document.getElementById('gcreceiverPhone').value.trim());
  params.append('amount',       document.getElementById('gcamount').value.trim());
  params.append('message',      document.getElementById('gcmessage').value.trim());

  try {
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: params });
    document.getElementById('gcSuccess').style.display = 'block';
    document.getElementById('giftCardForm').reset();
  } catch {
    document.getElementById('gcError').style.display = 'block';
  }
  btn.disabled = false;
  btn.textContent = 'APPLY NOW';
}

// --- 10. GOOGLE SHEETS — FEEDBACK ---
async function submitFeedback(e) {
  e.preventDefault();
  const btn = document.getElementById('fbBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  document.getElementById('fbSuccess').style.display = 'none';
  document.getElementById('fbError').style.display   = 'none';

  const ratingEl = document.querySelector('input[name="rating"]:checked');
  const params   = new URLSearchParams();
  params.append('formType', 'feedback');
  params.append('fullName', document.getElementById('fbname').value.trim());
  params.append('address',  document.getElementById('fbaddress').value.trim());
  params.append('phone',    document.getElementById('fbphone').value.trim());
  params.append('feedback', document.getElementById('fbfeedback').value.trim());
  params.append('rating',   ratingEl ? ratingEl.value + ' stars' : 'Not rated');

  try {
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: params });
    document.getElementById('fbSuccess').style.display = 'block';
    document.getElementById('feedbackForm').reset();
  } catch {
    document.getElementById('fbError').style.display = 'block';
  }
  btn.disabled = false;
  btn.textContent = 'SUBMIT FEEDBACK';
}
