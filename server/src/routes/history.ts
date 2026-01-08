import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Save workout log
router.post('/', authenticate, async (req: any, res) => {
    const { name, type, duration_seconds, distance_meters, calories_burned, exercises } = req.body;

    try {
        // Start transaction
        await query('BEGIN');

        const logResult = await query(
            `INSERT INTO workout_logs (user_id, name, type, duration_seconds, distance_meters, calories_burned)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.id, name, type, duration_seconds, distance_meters || 0, calories_burned || 0]
        );

        const logId = logResult.rows[0].id;

        if (exercises && Array.isArray(exercises)) {
            for (const ex of exercises) {
                await query(
                    `INSERT INTO log_exercises (log_id, name, type, reps, sets, weight_kg, duration_seconds)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [logId, ex.name, ex.type, ex.reps, ex.sets, ex.weight_kg, ex.duration_seconds]
                );
            }
        }

        await query('COMMIT');
        res.status(201).json(logResult.rows[0]);
    } catch (err: any) {
        await query('ROLLBACK');
        console.error('Error saving workout log:', err);
        res.status(500).json({ error: 'Database error', detail: err.message });
    }
});

// Get all logs for user
router.get('/', authenticate, async (req: any, res) => {
    try {
        const result = await query(
            'SELECT * FROM workout_logs WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get detailed log (with exercises)
router.get('/:id', authenticate, async (req: any, res) => {
    try {
        const logResult = await query(
            'SELECT * FROM workout_logs WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (logResult.rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }

        const exercisesResult = await query(
            'SELECT * FROM log_exercises WHERE log_id = $1',
            [req.params.id]
        );

        res.json({
            ...logResult.rows[0],
            exercises: exercisesResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a log
router.delete('/:id', authenticate, async (req: any, res) => {
    try {
        await query('DELETE FROM workout_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Log deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
