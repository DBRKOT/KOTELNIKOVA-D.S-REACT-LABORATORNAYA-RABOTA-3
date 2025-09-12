import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Navigation from './components/Navigation';
import ServicesList from './components/ServicesList';
import Cart from './components/Cart';
import AppointmentsList from './components/AppointmentsList';
import { getCurrentUser } from './api/auth';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    if (loading) {
        return <div style={{ padding: 20, textAlign: 'center' }}>Загрузка.</div>;
    }

return (
        <Router>
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#6c6ca0ff',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {!user ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #8435a1ff 0%, #764ba2 100%)'
                    }}>
                        <LoginForm onLogin={handleLogin} />
                    </div>
                ) : (
                    <>
                        <Navigation />
                        <main style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '20px',
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '1400px'
                            }}>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/services" replace />} />
                                    <Route path="/services" element={<ServicesList />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/appointments" element={<AppointmentsList />} />
                                </Routes>
                            </div>
                        </main>
                    </>
                )}
            </div>
        </Router>
    );
}

export default App;