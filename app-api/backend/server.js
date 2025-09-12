const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sql = require('mssql'); 
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

app.use(cors());
app.use(express.json());

const sqlConfig = {
    user: process.env.DB_USER || 'dbrkot',
    password: process.env.DB_PASSWORD || '123',
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || 'PCStore',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
        connectTimeout: 30000,
    }
};

// Создаем пул подключений
const pool = new sql.ConnectionPool(sqlConfig);
let poolConnect = pool.connect();

// Middleware: простая аутентификация JWT
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Требуется авторизация' });
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Неверный формат токена' });
    const token = parts[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

// 🔹 Аутентификация
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Введите email и пароль' });
    }

    try {
        await poolConnect;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query(`
                SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, r.role_name as role
                FROM Users u
                INNER JOIN Roles r ON u.role_id = r.role_id
                WHERE u.email = @email AND u.password_hash = @password
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = result.recordset[0];
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ ...user, token });
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Услуги
app.get('/api/services', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request().query(`
            SELECT service_id as id, name, description, price, created_at 
            FROM Services 
            ORDER BY created_at DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка получения услуг:', error);
        res.status(500).json({ error: 'Ошибка получения услуг' });
    }
});

app.get('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT service_id as id, name, description, price, created_at FROM Services WHERE service_id = @id');

        if (!result.recordset.length) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Ошибка получения услуги:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Корзина
app.get('/api/cart', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.user_id;
        await poolConnect;
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT c.cart_id, c.service_id, c.quantity, s.name, s.description, s.price, c.added_at
                FROM Cart c
                LEFT JOIN Services s ON c.service_id = s.service_id
                WHERE c.user_id = @user_id
                ORDER BY c.added_at DESC
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ error: 'Ошибка получения корзины' });
    }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { service_id, quantity } = req.body;

        if (!service_id) return res.status(400).json({ error: 'service_id обязателен' });
        const qty = Math.max(1, parseInt(quantity || 1, 10));

        await poolConnect;

        // Проверяем, есть ли уже в корзине
        const existing = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('service_id', sql.Int, service_id)
            .query('SELECT cart_id, quantity FROM Cart WHERE user_id = @user_id AND service_id = @service_id');

        if (existing.recordset.length) {
            const newQty = existing.recordset[0].quantity + qty;
            const upd = await pool.request()
                .input('cart_id', sql.Int, existing.recordset[0].cart_id)
                .input('quantity', sql.Int, newQty)
                .query('UPDATE Cart SET quantity = @quantity WHERE cart_id = @cart_id; SELECT * FROM Cart WHERE cart_id = @cart_id');
            return res.status(200).json(upd.recordset[0]);
        }

        const insert = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('service_id', sql.Int, service_id)
            .input('quantity', sql.Int, qty)
            .query('INSERT INTO Cart (user_id, service_id, quantity) OUTPUT INSERTED.* VALUES (@user_id, @service_id, @quantity)');

        res.status(201).json(insert.recordset[0]);
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        res.status(500).json({ error: 'Ошибка добавления в корзину' });
    }
});

app.delete('/api/cart/:cartId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const cartId = parseInt(req.params.cartId, 10);

        await poolConnect;
        const check = await pool.request()
            .input('cart_id', sql.Int, cartId)
            .query('SELECT cart_id, user_id FROM Cart WHERE cart_id = @cart_id');

        if (!check.recordset.length) return res.status(404).json({ error: 'Элемент корзины не найден' });
        if (check.recordset[0].user_id !== userId) return res.status(403).json({ error: 'Нет доступа' });

        await pool.request()
            .input('cart_id', sql.Int, cartId)
            .query('DELETE FROM Cart WHERE cart_id = @cart_id');

        res.json({ message: 'Удалено' });
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

// 🔹 Appointments
app.get('/api/appointments/simple', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request().query('SELECT TOP 5 * FROM Appointments');
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка запроса Appointments:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/appointments', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request().query(`
            SELECT 
                a.appointment_id,
                a.user_id,
                u.first_name + ' ' + u.last_name as user_name,
                u.email as user_email,
                a.product_id,
                p.name as product_name,
                p.price as product_price,
                a.service_id,
                s.name as service_name,
                s.price as service_price,
                a.quantity,
                a.status,
                a.created_at
            FROM Appointments a
            LEFT JOIN Users u ON a.user_id = u.user_id
            LEFT JOIN Products p ON a.product_id = p.product_id
            LEFT JOIN Services s ON a.service_id = s.service_id
            ORDER BY a.created_at DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка полного запроса:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { user_id, product_id, service_id, quantity, status } = req.body;
        
        await poolConnect;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('product_id', sql.Int, product_id)
            .input('service_id', sql.Int, service_id)
            .input('quantity', sql.Int, quantity || 1)
            .input('status', sql.NVarChar, status || 'новый')
            .query(`
                INSERT INTO Appointments (user_id, product_id, service_id, quantity, status)
                OUTPUT INSERTED.*
                VALUES (@user_id, @product_id, @service_id, @quantity, @status)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Ошибка создания записи:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/appointments/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE Appointments 
                SET status = @status 
                WHERE appointment_id = @id;
                
                SELECT * FROM Appointments WHERE appointment_id = @id;
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Ошибка обновления записи:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Appointments WHERE appointment_id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }
        
        res.json({ message: 'Запись успешно удалена', id: parseInt(id) });
    } catch (error) {
        console.error('Ошибка удаления записи:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Продукты
app.get('/api/products', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request().query(`
            SELECT product_id as id, name, description, category, price, stock_quantity, created_at 
            FROM Products 
            ORDER BY created_at DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка получения продуктов:', error);
        res.status(500).json({ error: 'Ошибка получения продуктов' });
    }
});

// 🔹 Тестовые endpoints
app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!', timestamp: new Date() });
});

app.get('/api/test-db', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request().query('SELECT GETDATE() as current_time_db');
        res.json({ 
            message: 'Подключение к БД работает!',
            current_time: result.recordset[0].current_time_db
        });
    } catch (error) {
        console.error('Ошибка теста БД:', error);
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log(`- Auth: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`- Services: GET http://localhost:${PORT}/api/services`);
    console.log(`- Products: GET http://localhost:${PORT}/api/products`);
    console.log(`- Cart: GET/POST/DELETE http://localhost:${PORT}/api/cart`);
    console.log(`- Appointments: GET/POST/PUT/DELETE http://localhost:${PORT}/api/appointments`);
});