import { existsSync } from 'node:fs';
import path from 'node:path';

import express, { type Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createApiRouter, type ApiDependencies } from './routes/api.js';

export interface CreateAppOptions extends ApiDependencies {
  /** Directory holding the built client. Omitted in dev, where Vite serves it. */
  clientDir?: string;
}

export function createApp({ clientDir, ...deps }: CreateAppOptions): Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // react-bootstrap injects inline styles for positioned components.
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // Rate limiting protects the mining endpoints, which are expensive; the
  // frontend polls the read endpoints, so the ceiling has to clear that.
  app.use(
    '/api',
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { type: 'error', message: 'Too many requests, please slow down.' },
    })
  );

  app.use('/api', createApiRouter(deps));
  app.use('/api', notFoundHandler);

  if (clientDir && existsSync(clientDir)) {
    app.use(express.static(clientDir));

    // SPA fallback: client-side routes such as /blocks are not files on disk,
    // so any non-API GET returns the app shell and lets the router resolve it.
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
