const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Fail fast if critical env vars are missing in production
const validateEnv = require('./config/validateEnv');
validateEnv();

const authRoutes = require('./routes/auth');
const capsuleRoutes = require('./routes/capsules');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');
const milestoneRoutes = require('./routes/milestones');
const analyticsRoutes = require('./routes/analytics');
const { startScheduler } = require('./services/capsuleScheduler');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

console.log('\n🔧 ========================================');
console.log('   CONFIGURATION CHECK');
console.log('========================================');
console.log(`   PORT: ${PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ NOT SET'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ NOT SET'}`);
console.log(`   ENCRYPTION_KEY: ${process.env.ENCRYPTION_KEY ? '✅ Configured' : '❌ NOT SET'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ NOT SET'}`);
console.log('========================================\n');

// Trust proxy - Required for Railway, Render, Heroku, etc. (behind reverse proxy)
// This allows Express to correctly read X-Forwarded-* headers
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// CORS configuration - Production safe (updated for Railway deployment)
const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
      .split(',')
      .map(o => normalizeOrigin(o.trim()))
      .filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];

// In production, if FRONTEND_URL is set but not in allowedOrigins, add it
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  const norm = normalizeOrigin(process.env.FRONTEND_URL);
  if (norm && !allowedOrigins.includes(norm)) {
    allowedOrigins.push(norm);
  }
}

console.log('🔐 CORS Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   ALLOWED_ORIGINS: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'NONE (will allow all)'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);

// More permissive CORS for production to avoid blocking requests
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins in non-production (dev mode)
    if (process.env.NODE_ENV !== 'production') return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    // In production, if origins are configured, check them
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      console.warn(`⚠️  CORS: Request from ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
      // Still allow for auth endpoints to prevent 405 errors
      return callback(null, true); // Changed to allow instead of block
    }

    // If no origins configured, allow all to avoid accidental lockout
    console.log(`⚠️  No ALLOWED_ORIGINS set - allowing all origins (set FRONTEND_URL or ALLOWED_ORIGINS in production)`);
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Also explicitly handle OPTIONS preflight for all routes (helps some proxies/hosts)
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with retry and fallback
const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soulsafe', {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB connected successfully');
      console.log('📦 Using database:', mongoose.connection.name);
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed:`, err.message);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('❌ MongoDB connection failed after all retries');
        console.warn('⚠️  Running without database connection. Some features will be limited.');
        console.warn('💡 To fix: Check your MONGODB_URI environment variable');
      }
    }
  }
};

// Connect to DB (non-blocking, server starts anyway)
connectDB().catch(err => {
  console.error('Database connection initialization error:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple root health check (no dependencies)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'soulsafe-backend' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Readiness check that verifies Mongo connectivity
app.get('/api/ready', (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1; // 1 === connected
  const statusCode = mongoReady ? 200 : 503;
  return res.status(statusCode).json({
    status: mongoReady ? 'READY' : 'NOT_READY',
    mongoConnected: mongoReady,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Ensure CORS headers are present on error responses as well
  try {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  } catch (e) {
    // ignore header set errors
  }
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server - bind to 0.0.0.0 for Railway/Docker compatibility
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ========================================');
  console.log(`✅ SoulSafe AI Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Server listening on 0.0.0.0:${PORT}`);
  console.log('🚀 ========================================\n');
  
  // Start capsule reminder scheduler (checks every hour for capsules unlocking in 24 hours)
  startScheduler();
});

// Set server timeout to prevent Railway from killing the process
server.setTimeout(65000); // 65 seconds - longer than Railway's typical health check timeout

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    throw error;
  }
});

// Graceful shutdown to avoid dropping in-flight requests
let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection', err);
  }
  
  process.exit(0);
};

// Only handle SIGINT (Ctrl+C) for local development
// Railway/Render will handle SIGTERM on their own
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} else {
  // In production, just log SIGTERM but let platform handle it
  process.on('SIGTERM', () => {
    console.log('SIGTERM received - platform will handle shutdown');
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Keep process alive
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

module.exports = app;
