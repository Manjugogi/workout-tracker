import pool from './src/db/index.js';

async function searchId() {
    const id = 'd7e6b893-3079-4cd4-8a4f-34dd394af0b1';
    try {
        const resProtocols = await pool.query('SELECT * FROM protocols WHERE id = $1', [id]);
        console.log('Protocols with ID:', resProtocols.rows);

        const resLogs = await pool.query('SELECT * FROM workout_logs WHERE id = $1', [id]);
        console.log('Workout Logs with ID:', resLogs.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

searchId();
