import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
// Adjust path to find schema.sql in server root (one level up from scripts/, effectively ../schema.sql if this is in server/scripts, 
// OR simply look in server root if we place this script there. Let's place it in server root for simplicity.)
// Wait, I will save this as server/init-db-remote.js. So schema is in ./schema.sql
const __dirname = path.dirname(__filename);

const databaseUrl = process.argv[2];

if (!databaseUrl) {
    console.error("Please provide the connection string as an argument.");
    console.error("Usage: node init-db-remote.js <YOUR_CONNECTION_STRING>");
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function init() {
    try {
        console.log("Connecting to database...");
        await client.connect();

        console.log("Reading schema.sql...");
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema...");
        await client.query(schema);

        console.log("✅ Database initialized successfully!");
    } catch (err) {
        console.error("❌ Error initializing database:", err);
    } finally {
        await client.end();
    }
}

init();
