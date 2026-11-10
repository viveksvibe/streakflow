import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('Health Check Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.service).toBe('streakflow');
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.database).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
