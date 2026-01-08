import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import protocolRoutes from './routes/protocols.js';
import profileRoutes from './routes/profile.js';
import uploadRoutes from './routes/upload.js';
import historyRoutes from './routes/history.js';
import { initDb } from './db/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

console.log('Registering Auth routes...');
app.use('/api/auth', authRoutes);
console.log('Registering Protocol routes...');
app.use('/api/protocols', protocolRoutes);
console.log('Registering Profile routes...');
app.use('/api/profile', profileRoutes);
console.log('Registering Upload routes...');
app.use('/api/upload', uploadRoutes);
console.log('Registering History routes...');
app.use('/api/history', historyRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

const startServer = async () => {
    try {
        await initDb();
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
