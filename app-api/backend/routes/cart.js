const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

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

async function ensureCartTable() {
    const pool = await sql.connect();
    const checkSql = `
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cart]') AND type in (N'U'))
    BEGIN
        CREATE TABLE [dbo].[Cart](
            cart_id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            service_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            added_at DATETIME DEFAULT GETDATE(),
            CONSTRAINT FK_Cart_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
            CONSTRAINT FK_Cart_Services FOREIGN KEY (service_id) REFERENCES Services(service_id)
        );
    END
    `;
    await pool.request().query(checkSql);
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        await ensureCartTable();
        const userId = req.user.user_id;
        const pool = await sql.connect();
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
    } catch (err) {
        console.error('Ошибка получения корзины:', err);
        res.status(500).json({ error: 'Ошибка получения корзины' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        await ensureCartTable();
        const userId = req.user.user_id;
        const { service_id, quantity } = req.body;

        if (!service_id) return res.status(400).json({ error: 'service_id обязателен' });
        const qty = Math.max(1, parseInt(quantity || 1, 10));

        const pool = await sql.connect();

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
    } catch (err) {
        console.error('Ошибка добавления в корзину:', err);
        res.status(500).json({ error: 'Ошибка добавления в корзину' });
    }
});

router.delete('/:cartId', authMiddleware, async (req, res) => {
    try {
        await ensureCartTable();
        const userId = req.user.user_id;
        const cartId = parseInt(req.params.cartId, 10);

        const pool = await sql.connect();
        const check = await pool.request()
            .input('cart_id', sql.Int, cartId)
            .query('SELECT cart_id, user_id FROM Cart WHERE cart_id = @cart_id');

        if (!check.recordset.length) return res.status(404).json({ error: 'Элемент корзины не найден' });
        if (check.recordset[0].user_id !== userId) return res.status(403).json({ error: 'Нет доступа' });

        await pool.request()
            .input('cart_id', sql.Int, cartId)
            .query('DELETE FROM Cart WHERE cart_id = @cart_id');

        res.json({ message: 'Удалено' });
    } catch (err) {
        console.error('Ошибка удаления из корзины:', err);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

module.exports = router;
