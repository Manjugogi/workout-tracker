import pool from './src/db/index.js';

async function fullCheck() {
    try {
        const users = await pool.query('SELECT id, email FROM users');
        console.log('--- USERS ---');
        users.rows.forEach(u => console.log(`${u.email}: ${u.id}`));

        const protocols = await pool.query('SELECT id, user_id, name FROM protocols');
        console.log('--- PROTOCOLS ---');
        protocols.rows.forEach(p => console.log(`${p.name} (${p.id}) -> owner: ${p.user_id}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fullCheck();
