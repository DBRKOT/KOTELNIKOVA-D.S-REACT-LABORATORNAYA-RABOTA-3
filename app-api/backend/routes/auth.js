const express = require('express');
const router = express.Router();
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key'; 

const sqlConfig = {
    user: String(process.env.DB_USER || 'dbrkot'),
    password: String(process.env.DB_PASSWORD || '123'),
    server: String(process.env.DB_HOST || 'localhost'),
    port: parseInt(process.env.DB_PORT || '1433'),
    database: String(process.env.DB_NAME || 'PCStore'),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
        connectTimeout: 30000,
    }
};

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Подробная отладка конфигурации:');
    console.log('SQL Config:', JSON.stringify(sqlConfig, null, 2));

    if (!email || !password) {
        return res.status(400).json({ error: 'Введите email и пароль' });
    }

    try {
        console.log('Попытка подключения к БД...');
        const pool = await sql.connect(sqlConfig);
        console.log('Подключение успешно');

        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query(`
                SELECT user_id, username, email, role_id
                FROM Users
                WHERE email = @email AND password_hash = @password
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = result.recordset[0];
        
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                username: user.username, 
                email: user.email, 
                role_id: user.role_id 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role_id: user.role_id,
            token: token 
        });
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
