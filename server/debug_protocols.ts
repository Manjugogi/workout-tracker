import pool from './src/db/index.js';

async function checkProtocols() {
    try {
        const res = await pool.query(`
            SELECT p.id, p.user_id, p.name, u.email 
            FROM protocols p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 10;
        `);
        console.log('Recent Protocols:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProtocols();
