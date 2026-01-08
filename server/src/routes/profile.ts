import { Router } from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Get profile
router.get('/', authenticate, async (req: any, res) => {
    try {
        const result = await query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Create/Update profile
router.post('/', authenticate, async (req: any, res) => {
    const { name, date_of_birth, height_cm, weight_kg, city, area, avatar_url } = req.body;

    console.log('--- Profile Update Attempt ---');
    console.log('User:', req.user.id);
    console.log('Body:', req.body);

    // Robust sanitization
    const sName = name || null;
    const sDOB = (date_of_birth === '' || !date_of_birth) ? null : date_of_birth;

    let sHeight = null;
    if (height_cm !== undefined && height_cm !== null && height_cm !== '') {
        sHeight = parseFloat(height_cm);
        if (isNaN(sHeight)) sHeight = null;
    }

    let sWeight = null;
    if (weight_kg !== undefined && weight_kg !== null && weight_kg !== '') {
        sWeight = parseFloat(weight_kg);
        if (isNaN(sWeight)) sWeight = null;
    }

    const sCity = city || null;
    const sArea = area || null;
    const sAvatar = avatar_url || null;

    const params = [req.user.id, sName, sDOB, sHeight, sWeight, sCity, sArea, sAvatar];
    console.log('Params to Query:', params);

    try {
        const result = await query(
            `INSERT INTO profiles (user_id, name, date_of_birth, height_cm, weight_kg, city, area, avatar_url, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id) DO UPDATE SET
             name = EXCLUDED.name,
             date_of_birth = EXCLUDED.date_of_birth,
             height_cm = EXCLUDED.height_cm,
             weight_kg = EXCLUDED.weight_kg,
             city = EXCLUDED.city,
             area = EXCLUDED.area,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            params
        );
        console.log('SUCCESS: Profile updated.');
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error('ERROR: Profile update failed.');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        // Return actual error for debugging
        res.status(500).json({ error: err.message || 'Database error', code: err.code });
    }
});

export default router;
