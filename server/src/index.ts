import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import protocolRoutes from './routes/protocols.js';
import { initDb } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/protocols', protocolRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
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
