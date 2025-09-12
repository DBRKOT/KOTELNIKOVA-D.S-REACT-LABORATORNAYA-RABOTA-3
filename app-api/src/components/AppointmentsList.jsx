import { useEffect, useState } from 'react';
import { getAppointments } from '../api/appointments';

export default function AppointmentsList() {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await getAppointments();
            setAppointments(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка при загрузке записей:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleRefresh = () => {
        loadAppointments();
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Загрузка записей...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ color: 'red', padding: '20px' }}>
                <div>Ошибка: {error}</div>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (!appointments.length) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Записей не найдено</div>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#9a28a7ff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Обновить
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Список записей ({appointments.length})</h2>
                <button 
                    onClick={handleRefresh}
                    style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Обновить
                </button>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                {appointments.map(a => (
                    <div key={a.appointment_id} style={{ 
                        border: '1px solid #c441b3ff', 
                        padding: '20px', 
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>ID записи:</strong> 
                            <span style={{marginLeft: '8px', color: '#007bff' }}>{a.AppointmentID}</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>ID пользователя:</strong> 
                            <span style={{ marginLeft: '8px', color: '#007bff' }}>{a.UserID}</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>ID услуги:</strong> 
                            <span style={{ marginLeft: '8px', color: '#007bff' }}>{a.ServiceID}</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>Дата и время:</strong> 
                            <span style={{ marginLeft: '8px', color: "black" }}>{formatDate(a.AppointmentDate)}</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>Количество:</strong> 
                            <span style={{ marginLeft: '8px', color: "black" }}>{a.Quantity}</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>Сумма:</strong> 
                            <span style={{ marginLeft: '8px', color: "black" }}>{a.TotalAmount} руб.</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#495057' }}>Примечания:</strong> 
                            <span style={{ marginLeft: '8px', color: "black" }}>{a.Notes || 'нет'}</span>
                        </div>
                        <div>
                            <strong style={{ color: '#495057' }}>Статус:</strong> 
                            <span 
                                style={{ 
                                    marginLeft: '8px', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    backgroundColor: a.Status === 'Подтвержден' ? '#d4edda' : 
                                                   a.Status === 'Отменен' ? '#f8d7da' : '#f9cdffff',
                                    color: a.Status === 'Подтвержден' ? '#155724' : 
                                           a.Status === 'Отменен' ? '#721c24' : '#7a0485ff'
                                }}
                            >
                                {a.Status || 'Не указан'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}