import { products } from '../data/products';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const PRODUCT_STORAGE_KEY = 'lumin-optics-catalog';
const ADMIN_TOKEN_KEY = 'lumin-optics-admin-token';
const USER_TOKEN_KEY = 'lumin-optics-user-token';
const USER_PROFILE_KEY = 'lumin-optics-user-profile';
// Reserved NANP 555-0100 demo destination; production uses the protected project secret.
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '15550100100';

async function request(path, options = {}) {
  const { authToken, ...fetchOptions } = options;
  const headers = { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const response = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `API request failed: ${response.status}`);
  }
  return response.json();
}

function readStoredProducts() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(PRODUCT_STORAGE_KEY) || 'null');
    return Array.isArray(stored) && stored.length ? stored : null;
  } catch {
    return null;
  }
}

export async function getProducts() {
  try {
    const remote = await request('/api/products');
    if (remote?.products?.length) return remote.products.map((item) => ({ ...(products.find((product) => product.id === item.id) || {}), ...item }));
  } catch {
    // The preview fallback below is used when the optional API is unavailable.
  }
  const stored = readStoredProducts();
  return stored || products;
}

export async function loginAdmin(credentials) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
}

export async function signUpUser(credentials) {
  return request('/api/auth/signup', { method: 'POST', body: JSON.stringify(credentials) });
}

export async function loginUser(credentials) {
  return request('/api/auth/customer-login', { method: 'POST', body: JSON.stringify(credentials) });
}

export async function getUserSession(token = readUserToken()) {
  if (!token) throw new Error('Account session missing.');
  return request('/api/account/session', { authToken: token });
}

export function readUserToken() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(USER_TOKEN_KEY) || '';
}

export function readUser() {
  if (typeof window === 'undefined') return null;
  try {
    const user = JSON.parse(window.sessionStorage.getItem(USER_PROFILE_KEY) || 'null');
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

export function storeUserSession({ token, user }) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(USER_TOKEN_KEY, token);
  window.sessionStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
}

export function clearUserSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(USER_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_PROFILE_KEY);
}

export async function getAdminSession(token = readAdminToken()) {
  if (!token) throw new Error('Admin session missing.');
  return request('/api/admin/session', { authToken: token });
}

export function readAdminToken() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function storeAdminToken(token) {
  if (typeof window !== 'undefined') window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function saveProducts(nextProducts, token = readAdminToken()) {
  await request('/api/admin/products', { method: 'PUT', authToken: token, body: JSON.stringify({ products: nextProducts }) });
  return nextProducts;
}

export function resetStoredProducts() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(PRODUCT_STORAGE_KEY);
}

export function buildWhatsAppUrl({ product, name = '', email = '', message = '' } = {}) {
  const selectedFrame = product ? `I’m interested in the ${product.name} (${money(product.price)}).` : 'I’d like help choosing a Lumin Optics frame.';
  const customerLine = name || email ? `\nName: ${name || 'Not provided'}${email ? `\nEmail: ${email}` : ''}` : '';
  const text = `${selectedFrame}${customerLine}${message ? `\n\n${message}` : ''}`;
  const number = WHATSAPP_NUMBER.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export async function createOrder(order) {
  try {
    return await request('/api/checkout', { method: 'POST', body: JSON.stringify(order) });
  } catch {
    return { orderId: `LO-${Date.now().toString().slice(-6)}`, status: 'preview-confirmed' };
  }
}

export async function saveFavorite(productId, saved = true) {
  try {
    return await request('/api/favorites', { method: 'POST', body: JSON.stringify({ productId, saved }) });
  } catch {
    return { productId, saved };
  }
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}
