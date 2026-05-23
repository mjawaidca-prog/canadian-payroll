import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Basic API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    application: 'Canadian Payroll System',
    version: '0.1.0',
    status: 'running',
  });
});

app.listen(PORT, () => {
  console.log(`✓ Payroll API server running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  API Status: http://localhost:${PORT}/api/status`);
});

export default app;
