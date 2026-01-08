import express from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

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
                [
                    protocol.id,
                    ex.name,
                    ex.type || 'Strength', // Default to Strength if missing
                    ex.duration ? Math.round(ex.duration) : null,
                    ex.reps,
                    ex.sets,
                    ex.rest,
                    ex.weight,
                    ex.distance,
                    i
                ]
            );
        }

        await query('COMMIT');
        protocol.exercises = exercises;
        res.status(201).json(protocol);
    } catch (err: any) {
        await query('ROLLBACK');
        console.error('Error creating protocol:', err);
        // Return actual error for debugging
        res.status(500).json({ error: err.message || 'Server error' });
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

// Update protocol
router.put('/:id', authenticate, async (req: any, res) => {
    const { name, category, exercises } = req.body;
    const protoId = req.params.id;
    const userId = req.user.id;
    console.log(`[DEBUG] PUT Protocol Request: ID='${protoId}' (len: ${protoId?.length}), User='${userId}' (len: ${userId?.length})`);

    try {
        await query('BEGIN');

        // Check ownership
        const ownershipCheck = await query(
            'SELECT id FROM protocols WHERE id = $1 AND user_id = $2',
            [protoId, userId]
        );

        console.log(`[DEBUG] Ownership check for ${protoId} returned ${ownershipCheck.rows.length} rows`);

        if (ownershipCheck.rows.length === 0) {
            await query('ROLLBACK');
            console.log(`[DEBUG] NOT FOUND: Protocol '${protoId}' does not belong to user '${userId}'`);
            return res.status(404).json({ error: 'Protocol not found' });
        }

        // Update protocol metadata
        await query(
            'UPDATE protocols SET name = $1, category = $2 WHERE id = $3',
            [name, category, protoId]
        );

        // Replace exercises
        await query('DELETE FROM exercises WHERE protocol_id = $1', [protoId]);
        console.log(`[DEBUG] Deleted old exercises for ${protoId}`);

        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            await query(
                'INSERT INTO exercises (protocol_id, name, type, duration, reps, sets, rest, weight, distance, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [protoId, ex.name, ex.type, ex.duration, ex.reps, ex.sets, ex.rest, ex.weight, ex.distance, i]
            );
        }

        await query('COMMIT');
        console.log(`[DEBUG] SUCCESS: Protocol ${protoId} updated`);
        res.json({ id: protoId, name, category, exercises });
    } catch (err) {
        await query('ROLLBACK');
        console.error('[DEBUG] ERROR in PUT /api/protocols:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
