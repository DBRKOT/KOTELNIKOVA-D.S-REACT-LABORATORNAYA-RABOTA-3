import { useEffect, useState } from 'react';
import { fetchServices } from '../api/services';
import { addToCart } from '../api/cart';
import { getCurrentUser } from '../api/auth';

export default function ServicesList() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [addingItems, setAddingItems] = useState({});
    const [user, setUser] = useState(null);

    useEffect(() => {
        load();
        checkAuth();
    }, []);

    const checkAuth = () => {
        try {
            const currentUser = getCurrentUser();
            console.log('Пользователь из getCurrentUser:', currentUser);
            
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Проверяем альтернативные места хранения
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (token && userData) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        console.log('Пользователь из localStorage:', parsedUser);
                        setUser(parsedUser);
                    } catch (parseError) {
                        console.error('Ошибка парсинга пользователя:', parseError);
                    }
                }
            }
        } catch (authError) {
            console.error('Ошибка проверки авторизации:', authError);
        }
    };

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await fetchServices();
            setServices(data);
            
            const initialQuantities = {};
            data.forEach(service => {
                initialQuantities[service.id] = 1;
            });
            setQuantities(initialQuantities);
            
        } catch (err) {
            console.error('Ошибка загрузки услуг:', err);
            setError('Не удалось загрузить услуги. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (serviceId, change) => {
        setQuantities(prev => {
            const newQuantity = Math.max(1, (prev[serviceId] || 1) + change);
            return {
                ...prev,
                [serviceId]: newQuantity
            };
        });
    };

    const handleAdd = async (serviceId) => {
        setMessage(null);
        setError(null);
        
        try {
            if (!user) {
                setError('Пожалуйста, войдите в систему чтобы добавлять в корзину');
                return;
            }
            
            if (user.role === 'admin') {
                setError('Администраторы не могут добавлять услуги в корзину');
                return;
            }
            
            const quantity = quantities[serviceId] || 1;
            
            setAddingItems(prev => ({ ...prev, [serviceId]: true }));
            
            await addToCart({ service_id: serviceId, quantity });
            
            setMessage(`Добавлено ${quantity} услуга(и) в корзину`);
            
            setQuantities(prev => ({
                ...prev,
                [serviceId]: 1
            }));
            
        } catch (err) {
            console.error('Ошибка добавления в корзину:', err);
            setError('Ошибка при добавлении в корзину: ' + err.message);
        } finally {
            setAddingItems(prev => ({ ...prev, [serviceId]: false }));
            
            setTimeout(() => {
                setMessage(null);
                setError(null);
            }, 3000);
        }
    };

    const handleEditService = (serviceId) => {
        console.log('Редактирование услуги:', serviceId);
    };

    const handleDeleteService = (serviceId) => {
        console.log('Удаление услуги:', serviceId);
    };

    if (loading) {
        return (
            <div style={{ 
                padding: '40px', 
                backgroundColor: '#1a1a2e',
                minHeight: '100vh',
                color: '#e2e2e2'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '40px'
                }}>
                    <h3 style={{ 
                        color: '#a991f7',
                        fontSize: '32px',
                        fontWeight: '700'
                    }}>
                        Каталог услуг
                    </h3>
                    {user && (
                        <div style={{ 
                            padding: '8px 16px',
                            backgroundColor: user.role === 'admin' ? '#dc3545' : '#6d28d9',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </div>
                    )}
                </div>
                
                <div style={{ 
                    display: 'grid', 
                    gap: '25px',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
                }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ 
                            border: '2px solid #6d28d9', 
                            padding: '25px', 
                            borderRadius: '16px', 
                            background: 'linear-gradient(145deg, #2d2b42, #232339)',
                            boxShadow: '0 8px 32px rgba(109, 40, 217, 0.15)',
                            height: '200px',
                            opacity: 0.7
                        }} />
                    ))}
                </div>
            </div>
        );
    }

    if (error && !services.length) {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                backgroundColor: '#1a1a2e',
                minHeight: '100vh',
                color: '#e2e2e2'
            }}>
                <h3 style={{ color: '#a991f7', marginBottom: '30px' }}>Ошибка загрузки</h3>
                <div style={{ 
                    color: '#855494ff', 
                    fontSize: '18px', 
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#2d2b42',
                    borderRadius: '12px',
                    border: '1px solid #6d28d9'
                }}>
                    ! {error}
                </div>
                <button 
                    onClick={load}
                    style={{ 
                        padding: '12px 24px',
                        backgroundColor: '#6d28d9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '40px', 
            backgroundColor: '#1a1a2e',
            minHeight: '100vh',
            color: '#e2e2e2'
        }}>
            {/* Заголовок с информацией о пользователе */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <h3 style={{ 
                    color: '#a991f7',
                    fontSize: '36px',
                    fontWeight: '700',
                    textShadow: '0 2px 10px rgba(169, 145, 247, 0.3)',
                    margin: 0
                }}>
                    Каталог услуг ({services.length})
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {user ? (
                        <>
                            <div style={{ 
                                padding: '10px 20px',
                                backgroundColor: user.role === 'admin' ? '#aa35dc86' : '#6d28d9',
                                color: 'white',
                                borderRadius: '25px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                {user.name || user.email} ({user.role === 'admin' ? 'Администратор' : 'Пользователь'})
                            </div>
                            {user.role === 'admin' && (
                                <button
                                    style={{ 
                                        padding: '10px 20px',
                                        backgroundColor: '#4e10b94a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                    onClick={() => console.log('Добавить новую услугу')}
                                >
                                    + Добавить услугу
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ 
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            Не авторизован
                        </div>
                    )}
                </div>
            </div>
            
            {error && (
                <div style={{
                    margin: '20px 0', 
                    padding: '16px',
                    color: '#905a9cff',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px solid #6d28d9',
                    fontSize: '16px'
                }}>
                    ! {error}
                </div>
            )}
            
            {message && (
                <div style={{
                    margin: '20px 0', 
                    padding: '16px',
                    color: '#a676abff',
                    backgroundColor: 'rgba(190, 81, 207, 0.1)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px solid #6d28d9',
                    fontSize: '16px'
                }}>
                    {message}
                </div>
            )}
            
            <div style={{ 
                display: 'grid', 
                gap: '30px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'
            }}>
                {services.map(s => (
                    <div key={s.id} style={{ 
                        border: '2px solid #6d28d9', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        background: 'linear-gradient(145deg, #2d2b42, #232339)',
                        boxShadow: '0 12px 40px rgba(109, 40, 217, 0.2)',
                        position: 'relative'
                    }}>
                        {/* Бейдж для администратора */}
                        {user?.role === 'admin' && (
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                padding: '5px 12px',
                                backgroundColor: '#9f35dc5d',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                ID: {s.id}
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '25px' }}>
                            <h4 style={{ 
                                margin: '0 0 15px 0', 
                                color: '#a991f7',
                                fontSize: '22px',
                                fontWeight: '600',
                                paddingRight: user?.role === 'admin' ? '60px' : '0'
                            }}>
                                {s.name}
                            </h4>
                            
                            <div style={{ 
                                fontSize: '15px', 
                                color: '#d0d0d0',
                                lineHeight: '1.6',
                                marginBottom: '20px'
                            }}>
                                {s.description}
                            </div>
                            
                            <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '15px',
                                color: '#a991f7',
                                fontSize: '14px'
                            }}>
                                <span>Длительность: {s.duration || '30-60'} минут</span>
                            </div>
                            
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '20px'
                            }}>
                                <div style={{ 
                                    fontWeight: '700', 
                                    color: '#a991f7',
                                    fontSize: '24px',
                                    textShadow: '0 2px 4px rgba(169, 145, 247, 0.3)'
                                }}>
                                    {s.price} руб.
                                </div>
                                
                                <div style={{ 
                                    color: '#d478cfff',
                                    fontSize: '14px',
                                    backgroundColor: 'rgba(207, 81, 203, 0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    border: '1px solid #c47cbd86'
                                }}>
                                    В наличии
                                </div>
                            </div>
                        </div>
                        
                        {/* Панель управления для администратора */}
                        {user?.role === 'admin' && (
                            <div style={{ 
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                borderRadius: '10px',
                                border: '1px solid #8b35dcff'
                            }}>
                                <button
                                    onClick={() => handleEditService(s.id)}
                                    style={{ 
                                        flex: 1,
                                        padding: '8px 16px',
                                        backgroundColor: '#af87f062',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Редактировать
                                </button>
                                <button
                                    onClick={() => handleDeleteService(s.id)}
                                    style={{ 
                                        flex: 1,
                                        padding: '8px 16px',
                                        backgroundColor: '#8b35dc4f',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Удалить
                                </button>
                            </div>
                        )}
                        
                        {/* Блок для добавления в корзину (только для пользователей) */}
                        {user?.role !== 'admin' && (
                            <>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '25px',
                                    padding: '18px',
                                    backgroundColor: 'rgba(109, 40, 217, 0.1)',
                                    borderRadius: '12px',
                                    border: '2px solid #6d28d9'
                                }}>
                                    <span style={{ 
                                        fontWeight: '600',
                                        color: '#a991f7'
                                    }}>
                                        Количество:
                                    </span>
                                    
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        gap: '15px'
                                    }}>
                                        <button
                                            onClick={() => handleQuantityChange(s.id, -1)}
                                            disabled={quantities[s.id] <= 1}
                                            style={{ 
                                                padding: '10px 15px',
                                                border: 'none',
                                                background: quantities[s.id] <= 1 ? '#4a5568' : '#6d28d9',
                                                color: 'white',
                                                borderRadius: '10px',
                                                cursor: quantities[s.id] <= 1 ? 'not-allowed' : 'pointer',
                                                fontWeight: '700',
                                                fontSize: '18px',
                                                minWidth: '45px',
                                                opacity: quantities[s.id] <= 1 ? 0.6 : 1
                                            }}
                                        >
                                            -
                                        </button>
                                        
                                        <span style={{ 
                                            minWidth: '50px', 
                                            textAlign: 'center',
                                            fontWeight: '700',
                                            fontSize: '20px',
                                            color: '#a991f7',
                                            padding: '10px',
                                            backgroundColor: 'rgba(109, 40, 217, 0.2)',
                                            borderRadius: '10px',
                                            border: '2px solid #6d28d9'
                                        }}>
                                            {quantities[s.id] || 1}
                                        </span>
                                        
                                        <button
                                            onClick={() => handleQuantityChange(s.id, 1)}
                                            style={{ 
                                                padding: '10px 15px',
                                                border: 'none',
                                                background: '#6d28d9',
                                                color: 'white',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: '700',
                                                fontSize: '18px',
                                                minWidth: '45px'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleAdd(s.id)}
                                    disabled={addingItems[s.id] || !user}
                                    style={{ 
                                        width: '100%',
                                        padding: '16px',
                                        backgroundColor: !user ? '#6c757d' : (addingItems[s.id] ? '#4a5568' : '#7510b994'),
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: !user || addingItems[s.id] ? 'not-allowed' : 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        opacity: !user || addingItems[s.id] ? 0.7 : 1
                                    }}
                                >
                                    {!user ? 'Войдите для покупок' : (addingItems[s.id] ? 'Добавляем' : 'Добавить в корзину')}
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}