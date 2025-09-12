const API_URL = 'http://localhost:3008/api/auth';

export async function login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка авторизации');
    }

    const data = await response.json();
    
    // Сохраняем токен в localStorage
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
    
    return data;
}

// Получаем токен из localStorage
export function getToken() {
    return localStorage.getItem('token');
}

// Получаем данные пользователя из токена
export function getCurrentUser() {
    const token = getToken();
    if (!token) return null;
    
    try {
        // Декодируем JWT токен (без проверки подписи)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (error) {
        console.error('Ошибка декодирования токена:', error);
        return null;
    }
}

// Выход из системы
export function logout() {
    localStorage.removeItem('token');
}