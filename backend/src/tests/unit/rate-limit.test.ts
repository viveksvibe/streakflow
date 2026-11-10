import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from '../../middlewares/rate-limit.js';

const noop = (_req: Request, _res: Response, next: NextFunction) => next();

const buildApp = (limiter: ReturnType<typeof rateLimit>) => {
  const app = express();
  app.use(limiter);
  app.get('/ping', (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return app;
};

describe('rateLimit middleware', () => {
  let limiter: ReturnType<typeof rateLimit>;
  let app: express.Express;

  beforeEach(() => {
    limiter = rateLimit({
      windowMs: 60_000,
      maxRequests: 3,
      blockDuration: 60_000,
    });
    app = buildApp(limiter);
  });

  it('should allow requests under the limit', async () => {
    for (let i = 0; i < 3; i += 1) {
      const response = await request(app).get('/ping');
      expect(response.status).toBe(200);
    }
  });

  it('should block requests beyond the limit with 429 and Retry-After', async () => {
    for (let i = 0; i < 3; i += 1) {
      await request(app).get('/ping');
    }

    const response = await request(app).get('/ping');

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('should keep blocking while the block window is active', async () => {
    for (let i = 0; i < 5; i += 1) {
      await request(app).get('/ping');
    }

    const response = await request(app).get('/ping');

    expect(response.status).toBe(429);
  });

  it('should keep separate stores per limiter instance', async () => {
    // Exhaust the first limiter.
    for (let i = 0; i < 3; i += 1) {
      await request(app).get('/ping');
    }
    expect((await request(app).get('/ping')).status).toBe(429);

    // A second limiter with identical options must not be affected.
    const otherLimiter = rateLimit({
      windowMs: 60_000,
      maxRequests: 3,
      blockDuration: 60_000,
    });
    const otherApp = buildApp(otherLimiter);

    const response = await request(otherApp).get('/ping');

    expect(response.status).toBe(200);
  });

  it('should respect custom key generators', async () => {
    const keyedLimiter = rateLimit({
      windowMs: 60_000,
      maxRequests: 1,
      blockDuration: 60_000,
      keyGenerator: (req) => String(req.headers['x-api-key'] ?? 'anon'),
    });
    const keyedApp = buildApp(keyedLimiter);

    const first = await request(keyedApp).get('/ping').set('x-api-key', 'user-a');
    const second = await request(keyedApp).get('/ping').set('x-api-key', 'user-b');
    const third = await request(keyedApp).get('/ping').set('x-api-key', 'user-a');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200); // different key, untouched
    expect(third.status).toBe(429); // same key, blocked
  });
});
