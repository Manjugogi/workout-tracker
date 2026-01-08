import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Signup
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Signup attempt for: ${email}`);
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email.toLowerCase(), passwordHash]
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (err: any) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'User already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res.json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
