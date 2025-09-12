import { useEffect, useState } from 'react';
import { getCart, removeFromCart } from '../api/cart';

export default function Cart() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [removingItems, setRemovingItems] = useState({});

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCart();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleRemove = async (cartId) => {
        try {
            setRemovingItems(prev => ({ ...prev, [cartId]: true }));
            await removeFromCart(cartId);
            setMessage('Товар удален из корзины');
            load();
            
            // Автоматически скрываем сообщение через 3 секунды
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (err) {
            setMessage('Ошибка удаления: ' + err.message);
        } finally {
            setRemovingItems(prev => ({ ...prev, [cartId]: false }));
        }
    };

    const total = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    // Скелетон для загрузки
    if (loading) {
        return (
            <div style={{ 
                padding: '40px', 
                maxWidth: '1000px', 
                margin: '0 auto',
                backgroundColor: '#1a1a2e',
                minHeight: '100vh',
                color: '#e2e2e2'
            }}>
                <h3 style={{ 
                    textAlign: 'center', 
                    marginBottom: '40px',
                    color: '#a991f7',
                    fontSize: '32px',
                    fontWeight: '700'
                }}>
                    Корзина
                </h3>
                
                <div style={{ 
                    color: '#a991f7', 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: '18px'
                }}>
                    Загрузка корзины
                </div>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ 
                            border: '2px solid #6d28d9', 
                            padding: '25px', 
                            borderRadius: '16px', 
                            background: 'linear-gradient(145deg, #2d2b42, #232339)',
                            boxShadow: '0 8px 32px rgba(109, 40, 217, 0.15)',
                            height: '150px',
                            opacity: 0.7,
                            animation: 'pulse 2s infinite'
                        }} />
                    ))}
                </div>
            </div>
        );
    }

    if (error && !items.length) {
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
                    color: '#945454ff', 
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
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#5b21b6';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#6d28d9';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (!items.length) return (
        <div style={{
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: '#1a1a2e',
            minHeight: '100vh',
            color: '#e2e2e2'
        }}>
            <h3 style={{ 
                textAlign: 'center', 
                marginBottom: '30px',
                color: '#a991f7',
                fontSize: '32px',
                fontWeight: '700'
            }}>
                Корзина
            </h3>
            <div style={{
                fontSize: '18px', 
                marginBottom: '20px',
                color: '#a991f7'
            }}>Корзина пуста</div>
            {message && <div style={{
                padding: '12px',
                backgroundColor: 'rgba(190, 81, 207, 0.1)',
                color: '#a676abff',
                borderRadius: '6px',
                marginTop: '10px',
                border: '1px solid #6d28d9'
            }}>{message}</div>}
        </div>
    );

    return (
        <div style={{ 
            padding: '40px', 
            maxWidth: '1000px', 
            margin: '0 auto',
            backgroundColor: '#1a1a2e',
            minHeight: '100vh',
            color: '#e2e2e2'
        }}>
            <h3 style={{
                textAlign: 'center',
                marginBottom: '50px',
                color: '#a991f7',
                fontSize: '36px',
                fontWeight: '700',
                textShadow: '0 2px 10px rgba(169, 145, 247, 0.3)'
            }}>
                Корзина ({items.length})
            </h3>
            
            {error && (
                <div style={{
                    margin: '20px 0', 
                    padding: '16px',
                    color: '#9c5a5aff',
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
            
            <div style={{ display: 'grid', gap: '25px' }}>
                {items.map(it => (
                    <div key={it.cart_id} style={{ 
                        border: '2px solid #6d28d9', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        background: 'linear-gradient(145deg, #2d2b42, #232339)',
                        boxShadow: '0 12px 40px rgba(109, 40, 217, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {removingItems[it.cart_id] && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #a991f7, #6d28d9)',
                                animation: 'loading 1.5s infinite'
                            }} />
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: 700, 
                                    color: '#a991f7', 
                                    fontSize: '22px',
                                    marginBottom: '15px'
                                }}>
                                    {it.name}
                                </div>
                                <div style={{ 
                                    fontSize: '15px', 
                                    color: '#d0d0d0',
                                    lineHeight: '1.6',
                                    marginBottom: '20px'
                                }}>
                                    {it.description}
                                </div>
                                <div style={{ 
                                    marginTop: '12px', 
                                    color: '#a991f7',
                                    fontSize: '16px'
                                }}>
                                    Количество: {it.quantity}
                                </div>
                                <div style={{ 
                                    marginTop: '15px', 
                                    color: '#a991f7', 
                                    fontWeight: '600',
                                    fontSize: '20px'
                                }}>
                                    {(it.price * it.quantity).toFixed(2)} руб.
                                </div>
                            </div>
                            <div style={{ 
                                textAlign: 'right', 
                                marginLeft: '30px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end'
                            }}>
                                <div style={{ 
                                    fontWeight: 700, 
                                    color: '#a991f7', 
                                    fontSize: '22px',
                                    marginBottom: '15px'
                                }}>
                                    {it.price} руб.
                                </div>
                                <button 
                                    onClick={() => handleRemove(it.cart_id)} 
                                    disabled={removingItems[it.cart_id]}
                                    style={{ 
                                        padding: '12px 20px',
                                        backgroundColor: removingItems[it.cart_id] ? '#4a5568' : '#6d28d9',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: removingItems[it.cart_id] ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        transition: 'all 0.3s ease',
                                        opacity: removingItems[it.cart_id] ? 0.7 : 1
                                    }}
                                    onMouseOver={(e) => {
                                        if (!removingItems[it.cart_id]) {
                                            e.target.style.backgroundColor = '#5b21b6';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (!removingItems[it.cart_id]) {
                                            e.target.style.backgroundColor = '#6d28d9';
                                            e.target.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {removingItems[it.cart_id] ? 'Удаление...' : 'Удалить'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ 
                marginTop: '40px', 
                padding: '25px',
                backgroundColor: 'rgba(109, 40, 217, 0.1)',
                borderRadius: '16px',
                border: '2px solid #6d28d9',
                textAlign: 'center'
            }}>
                <div style={{ 
                    fontWeight: 700, 
                    fontSize: '28px',
                    color: '#a991f7'
                }}>
                    Итого: {total.toFixed(2)} руб.
                </div>
            </div>
        </div>
    );
}