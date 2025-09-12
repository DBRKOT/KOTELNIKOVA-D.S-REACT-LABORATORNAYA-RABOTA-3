import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
    const location = useLocation();
    
    return (
        <nav style={{ 
            backgroundColor: '#623ecd92', 
            padding: '15px 20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: 'white'
                }}>
                    PC Store
                </div>
                
                <div style={{ display: 'flex', gap: '25px' }}>
                    <Link 
                        to="/services" 
                        style={{ 
                            textDecoration: 'none',
                            color: location.pathname === '/services' ? '#a58aadff' : 'white',
                            fontWeight: '600',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Услуги
                    </Link>
                    <Link 
                        to="/cart" 
                        style={{ 
                            textDecoration: 'none',
                            color: location.pathname === '/cart' ? '#ae96b8ff' : 'white',
                            fontWeight: '600',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Корзина
                    </Link>
                    <Link 
                        to="/appointments" 
                        style={{ 
                            textDecoration: 'none',
                            color: location.pathname === '/appointments' ? '#ae96b8ff' : 'white',
                            fontWeight: '600',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Записи
                    </Link>
                </div>
                
                <button 
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.reload();
                    }}
                    style={{ 
                        padding: '8px 16px', 
                        backgroundColor: 'transparent', 
                        color: 'white', 
                        border: '1px solid white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    Выйти
                </button>
            </div>
        </nav>
    );
}