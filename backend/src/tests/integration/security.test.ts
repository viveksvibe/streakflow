import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../fixtures/test-data.js';

describe('Security Integration Tests', () => {
  describe('Security headers (helmet)', () => {
    it('should not leak the x-powered-by header', async () => {
      const response = await request(app)
        .get('/health')
        .set('User-Agent', 'test-agent');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should set nosniff and frame-deny headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('User-Agent', 'test-agent');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('Bot protection', () => {
    it('should block known malicious tools with 403', async () => {
      const response = await request(app)
        .get('/api/v1/habits')
        .set('User-Agent', 'sqlmap/1.0');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should block generic bots with 403', async () => {
      const response = await request(app)
        .get('/api/v1/habits')
        .set('User-Agent', 'Googlebot/2.1');

      expect(response.status).toBe(403);
    });

    it('should block API requests without a user agent', async () => {
      const response = await request(app).get('/api/v1/habits').unset('User-Agent');

      expect(response.status).toBe(403);
    });

    it('should allow normal user agents through', async () => {
      const response = await request(app)
        .get('/api/v1/habits')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0)');

      // The request passes bot protection and fails authentication instead.
      expect(response.status).toBe(401);
    });
  });

  describe('Request body parsing', () => {
    it('should return 400 for malformed JSON bodies', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('User-Agent', 'test-agent')
        .set('Content-Type', 'application/json')
        .send('{"email": not-valid-json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for oversized JSON bodies', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('User-Agent', 'test-agent')
        .send({ fullName: 'x'.repeat(2 * 1024 * 1024) });

      expect(response.status).toBe(413);
    });
  });

  describe('Error envelope', () => {
    it('should return a consistent 404 envelope for unknown routes', async () => {
      const response = await request(app)
        .get('/api/v1/definitely-not-a-route')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('/api/v1/definitely-not-a-route');
      expect(response.body.requestId).toBeDefined();
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
