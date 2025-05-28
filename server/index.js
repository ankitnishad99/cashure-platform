// Production server entry point
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 10000;

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register all routes
registerRoutes(app).then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Cashure backend running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});