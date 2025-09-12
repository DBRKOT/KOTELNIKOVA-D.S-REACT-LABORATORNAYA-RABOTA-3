import { getToken } from './auth';

const API_BASE = 'http://localhost:3008/api';

// Функция для авторизованных запросов
async function authFetch(url, opts = {}) {
    const token = getToken();
    const headers = opts.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    opts.headers = { ...headers, 'Content-Type': 'application/json' };
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || 'Ошибка API');
    return data;
}

// Получить корзину пользователя
export async function getCart() {
    return authFetch(`${API_BASE}/cart`);
}

// Добавить товар в корзину
export async function addToCart({ service_id, quantity = 1 }) {
    return authFetch(`${API_BASE}/cart`, {
        method: 'POST',
        body: JSON.stringify({ service_id, quantity })
    });
}

// Удалить товар из корзины
export async function removeFromCart(cartId) {
    return authFetch(`${API_BASE}/cart/${cartId}`, { 
        method: 'DELETE' 
    });
}