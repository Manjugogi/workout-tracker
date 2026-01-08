import pool from './src/db/index.js';

async function checkOwnership() {
    const protocolId = 'd7e6b893-3079-4cd4-8a4f-34dd394af0b1';
    try {
        const res = await pool.query(`
            SELECT p.id as protocol_id, p.user_id as owner_id, u.email as owner_email, u.id as user_table_id
            FROM protocols p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = $1;
        `, [protocolId]);

        console.log('Protocol Owner Details:', res.rows[0]);

        const allUsers = await pool.query('SELECT id, email FROM users');
        console.log('All Users in DB:', allUsers.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOwnership();
