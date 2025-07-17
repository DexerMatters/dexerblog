import express, { json, urlencoded } from 'express';
const app = express();
const PORT = parseInt(process.env.PORT || "3001");
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
app.get('/', (_req, res) => {
    res.json({
        message: 'Hello from dexerun backend!',
        timestamp: new Date().toISOString()
    });
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
});
