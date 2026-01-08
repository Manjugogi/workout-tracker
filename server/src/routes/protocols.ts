import express from 'express';
import { query } from '../db/index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to authenticate
const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all protocols for user
router.get('/', authenticate, async (req: any, res) => {
    console.log(`Fetching protocols for user: ${req.user.id}`);
    try {
        const result = await query(
            'SELECT * FROM protocols WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        const protocols = result.rows;

        // Fetch exercises for each protocol
        for (const protocol of protocols) {
            const exercisesResult = await query(
                'SELECT * FROM exercises WHERE protocol_id = $1 ORDER BY order_index ASC',
                [protocol.id]
            );
            protocol.exercises = exercisesResult.rows;
        }

        res.json(protocols);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create protocol
router.post('/', authenticate, async (req: any, res) => {
    const { name, category, exercises } = req.body;
    console.log(`Creating protocol for user: ${req.user.id}`);
    try {
        // Start transaction
        await query('BEGIN');
        const protocolResult = await query(
            'INSERT INTO protocols (user_id, name, category) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, name, category]
        );
        const protocol = protocolResult.rows[0];

        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            await query(
                'INSERT INTO exercises (protocol_id, name, type, duration, reps, sets, rest, weight, distance, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [protocol.id, ex.name, ex.type, ex.duration, ex.reps, ex.sets, ex.rest, ex.weight, ex.distance, i]
            );
        }

        await query('COMMIT');
        protocol.exercises = exercises;
        res.status(201).json(protocol);
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete protocol
router.delete('/:id', authenticate, async (req: any, res) => {
    console.log(`Deleting protocol: ${req.params.id}`);
    try {
        await query('DELETE FROM protocols WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
