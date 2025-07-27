import express, { json, urlencoded } from 'express';
import * as db from './db.js';
import * as render from './render.js';
import { log } from './utils.js';
import { error } from 'console';
import fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

const client = new JwksClient({
  jwksUri: 'https://token.actions.githubusercontent.com/.well-known/jwks'
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (_err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

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

app.get('/cache-version', (_req, res) => {
  res.json({ version: Date.now().toString() });
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
    res.send(render.renderMarkdown(data));
  });
});

app.get('/categories', async (req, res) => {
  const params = req.query as { title?: string, id?: string };
  if (params.title) {
    const category = await db.selectCategoryByTitle(params.title);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } else if (params.id) {
    const category = await db.selectCategoryById(parseInt(params.id));
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } else {
    res.status(400).json({ error: 'Missing title or id parameter' });
  }
});

app.get('/subcategories', async (req, res) => {
  const params = req.query as { title?: string, id?: string };
  if (params.title) {
    const subcategory = await db.selectSubcategoriesByTitle(params.title);
    if (subcategory) {
      res.json(subcategory);
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } else if (params.id) {
    const subcategory = await db.selectSubcategoriesByParentId(parseInt(params.id));
    if (subcategory) {
      res.json(subcategory);
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } else {
    res.status(404).json({ error: 'Missing title or id parameter' });
  }
});

app.get('/documents', async (req, res) => {
  const params = req.query as { title?: string, category_id?: string };
  const documents = await db.queryDocuments(
    params.title,
    params.category_id ? parseInt(params.category_id) : undefined);
  res.json(documents);
});

app.head('/sync-repo', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    db.syncGithubRepo().catch((err) => {
      error('Error syncing GitHub repo:', err);
      res.status(500).json({ error: 'Failed to sync GitHub repo' });
    }).then(() => {
      db.syncLinks().then(() => {
        db.updateCategories();
      }).catch((err) => {
        error('Error syncing links:', err);
        res.status(500).json({ error: 'Failed to sync links' });
      });
    });
    return res.status(200).json({
      message: 'Syncing GitHub repo in the background',
      cacheVersion: Date.now().toString()
    });
  }
  const token = req.header('authorization')?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, getKey, {
    issuer: 'https://token.actions.githubusercontent.com',
    audience: 'dexerblog',
  }, (err, decoded) => {
    if (err)
      return res.status(401).json({ error: 'Invalid token' });
    log(`Token verified for user: ${decoded?.sub}`);
    db.syncGithubRepo().catch((err) => {
      error('Error syncing GitHub repo:', err);
      res.status(500).json({ error: 'Failed to sync GitHub repo' });
    }).then(() => {
      db.updateCategories();
    });
    res.status(200).json({
      message: 'Syncing GitHub repo in the background',
      cacheVersion: Date.now().toString()
    });
  })
});

app.post('/webhook/invalidate-cache', (req, res) => {
  const { event, repository } = req.body;

  if (event === 'push' && repository?.name === 'dexerblog-docs') {
    log('GitHub webhook received: invalidating cache');

    db.syncGithubRepo().catch((err) => {
      error('Error syncing GitHub repo:', err);
    }).then(() => {
      db.syncLinks().then(() => {
        db.updateCategories();
      }).catch((err) => {
        error('Error syncing links:', err);
      });
    });

    res.status(200).json({
      message: 'Cache invalidation triggered',
      cacheVersion: Date.now().toString()
    });
  } else {
    res.status(200).json({ message: 'Event ignored' });
  }
});

app.get('/navigation/:category', async (req, res) => {
  const categoryTitle = req.params.category;
  try {
    const navigationData = await db.getNavigationData(categoryTitle);
    if (!navigationData) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(navigationData);
  } catch (error) {
    log(`Error fetching navigation data: ${error}`);
    res.status(500).json({ error: 'Failed to fetch navigation data' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  log(`Backend server running on port ${PORT}`);
});

