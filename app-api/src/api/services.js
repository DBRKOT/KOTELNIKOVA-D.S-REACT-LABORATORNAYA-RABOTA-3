const API_BASE = 'http://localhost:3008/api';

export async function fetchServices() {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Ошибка при загрузке услуг');
    return await res.json();
}

export async function fetchServiceById(id) {
    const res = await fetch(`${API_BASE}/services/${id}`);
    if (!res.ok) throw new Error('Не удалось получить услугу');
    return await res.json();
}