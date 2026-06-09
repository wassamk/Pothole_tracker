// src/server.js
// Main Express application entry point — ES Modules

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Internal Modules ─────────────────────────────────────────────────
import connectDB from './config/db.js';
import i18nMiddleware from './middleware/i18n.js';
import errorHandler from './middleware/errorHandler.js';
import potholeRoutes from './features/potholes/pothole.routes.js';
import adminRoutes from './features/admin/admin.routes.js';

// ─── ES Module __dirname Shim ─────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Connect to MongoDB ───────────────────────────────────────────────
await connectDB();

// ─── Initialize Express ───────────────────────────────────────────────
const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────

// CORS: Allow requests from frontend dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  })
);

// Parse incoming JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger (condensed in production)
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// i18n: Attach req.t() translation helper to every request
app.use(i18nMiddleware);

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────
app.use('/api/potholes', potholeRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fix Karachi API is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: req.t('NOT_FOUND'),
    path: req.originalUrl,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Fix Karachi API Server`);
  console.log(`   Port:        ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   MongoDB:     ${process.env.MONGO_URI}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
});

export default app;
