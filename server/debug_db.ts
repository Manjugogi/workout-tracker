import pool from './src/db/index.js';

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'workout_logs';
        `);
        console.log('Columns in workout_logs:', res.rows);

        const res2 = await pool.query('SELECT * FROM workout_logs LIMIT 1;');
        console.log('Sample row from workout_logs:', res2.rows[0]);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
