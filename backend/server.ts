import express, { json, urlencoded } from 'express';
import { syncGithubRepo, updateCategories } from './db.js';
import { log } from './utils.js';
import { error } from 'console';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

import ip from 'ip';

console.log(ip.address());

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// CORS middleware for development
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// API routes
app.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

app.get('/content/{*path}', async (req, res) => {
  let params = (req.params as { path: String[] }).path;
  let path = "./repo/" + decodeURI(params.join("/"));
  log(`Requesting content for path: ${path}`);
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      log(`Error reading file at ${path}: ${err}`);
      return res.status(500).json({ error: 'Failed to read file' });
    }
    res.json({ content: data });
  });
});

app.head('/sync-repo', async (_req, res) => {
  syncGithubRepo().catch((err) => {
    error('Error syncing GitHub repo:', err);
    res.status(500).json({ error: 'Failed to sync GitHub repo' });
  }).then(() => {
    updateCategories();
  });
  res.status(200).json({ message: 'Syncing GitHub repo in the background' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  log(`Backend server running on port ${PORT}`);
});