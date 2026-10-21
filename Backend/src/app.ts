import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { env } from './config/env';
import { globalRateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/sanitizeInput';
import apiRouter from './routes/index';

const app: Application = express();

// ─── Trust Proxy (for rate limiter behind reverse proxy) ─────────────────────
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'https://api.razorpay.com',
          'https://generativelanguage.googleapis.com',
          'http://localhost:*',
          'http://127.0.0.1:*',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
          'https://*.supabase.co',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        frameSrc: ["'self'", 'https://api.razorpay.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin) || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// ─── Stripe Webhook Raw Body (must come BEFORE express.json) ──────────────────
app.use('/api/v1/payments/stripe/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(mongoSanitize());   // Prevent NoSQL injection
app.use(hpp());             // HTTP Parameter Pollution protection
app.use(sanitizeInput);     // XSS and Prototype Pollution defense

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Darsh Dental Depot API',
      customCss: '.swagger-ui .topbar { background-color: #2563eb; }',
    }),
  );
} catch {
  // Swagger doc not loaded — no docs endpoint
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Darsh Dental Depot API',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(env.API_PREFIX, apiRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler as any);

export default app;
