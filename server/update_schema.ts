import pool from './src/db/index.js';

const sql = `
-- Workout Logs table
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    distance_meters FLOAT DEFAULT 0,
    calories_burned FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Log Exercises table
CREATE TABLE IF NOT EXISTS log_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    reps INTEGER,
    sets INTEGER,
    weight_kg FLOAT,
    duration_seconds INTEGER
);
`;

async function updateSchema() {
    try {
        console.log('Running schema update...');
        await pool.query(sql);
        console.log('Schema update successful!');
        process.exit(0);
    } catch (err) {
        console.error('Schema update failed:', err);
        process.exit(1);
    }
}

updateSchema();
