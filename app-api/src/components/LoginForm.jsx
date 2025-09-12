import { useState } from 'react';
import { login } from '../api/auth';

export default function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const user = await login(email, password);
            onLogin(user); // передаём данные в App
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
            <h2>Авторизация</h2>

            <div style={{ marginBottom: 10 }}>
                <label>Email:</label><br />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: 8 }}
                />
            </div>

            <div style={{ marginBottom: 10 }}>
                <label>Пароль:</label><br />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: 8 }}
                />
            </div>

            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            {loading && <div>Загрузка.</div>}

            <button type="submit" style={{ padding: '10px 20px' }}>Войти</button>
        </form>
    );
}
