const API_URL = 'http://localhost:3008/api/appointments';

export async function getAppointments() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Ошибка при получении записей');
    }
    return await response.json();
}

export async function getAppointmentById(AppointmentID) {
    const response = await fetch(`${API_URL}/${AppointmentID}`);
    if (!response.ok) {
        throw new Error('Ошибка при получении записи');
    }
    return await response.json();
}

export async function createAppointment(AppointmentData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(AppointmentData),
    });
    if (!response.ok) {
        throw new Error('Ошибка при создании записи');
    }
    return await response.json();
}
