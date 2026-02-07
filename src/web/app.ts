import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './api';

import fs from 'fs';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

// API routes will be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the React app
const distPath = path.join(__dirname, '../../web/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return;
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Frontend dist folder not found. Please run "npm run build" first.');
  });
}

export default app;
