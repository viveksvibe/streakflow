import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma, cleanupTestData } from '../fixtures/test-data.ts';

const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

const registerUser = async (email: string, password = 'password123', extra = {}) =>
  request(app)
    .post('/api/v1/auth/register')
    .set('User-Agent', 'test-agent')
    .send({ fullName: 'John Doe', email, password, ...extra });

describe('Auth Integration Tests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const email = uniqueEmail('john');

      const response = await registerUser(email, 'password123', { timezone: 'UTC' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user.streakFreezeCredits).toBe(2);
    });

    it('should set an HttpOnly refresh token cookie', async () => {
      const response = await registerUser(uniqueEmail('cookie'));

      const setCookie = (response.headers['set-cookie'] ?? []) as unknown as string[];
      const refreshCookie = setCookie.find((cookie) => cookie.startsWith('refreshToken='));

      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('should not register user with existing email', async () => {
      const email = uniqueEmail('duplicate');

      await registerUser(email);

      const response = await registerUser(email);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should treat emails case-insensitively for duplicates', async () => {
      const email = uniqueEmail('case');

      await registerUser(email);

      const response = await registerUser(email.toUpperCase());

      expect(response.status).toBe(409);
    });

    it('should validate required fields', async () => {
      const response = await registerUser('');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject short passwords', async () => {
      const response = await registerUser(uniqueEmail('shortpw'), 'short');

      expect(response.status).toBe(400);
    });

    it('should reject invalid timezones', async () => {
      const response = await registerUser(uniqueEmail('badtz'), 'password123', {
        timezone: 'Not/AZone',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = uniqueEmail('login');

      await registerUser(email);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .send({ email, password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should login regardless of email case', async () => {
      const email = uniqueEmail('logincase');

      await registerUser(email);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .send({ email: email.toUpperCase(), password: 'password123' });

      expect(response.status).toBe(200);
    });

    it('should not login with invalid credentials', async () => {
      const email = uniqueEmail('login-invalid');

      await registerUser(email);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .send({ email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not login non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user profile', async () => {
      const email = uniqueEmail('me');

      const registerResponse = await registerUser(email);
      const accessToken = registerResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `accessToken=${accessToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.passwordHash).toBeUndefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });

    it('should return 401 with a garbage access token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', 'accessToken=garbage-token')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/auth/me', () => {
    it('should update the full name', async () => {
      const registerResponse = await registerUser(uniqueEmail('profile'));
      const accessToken = registerResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .patch('/api/v1/auth/me')
        .set('Cookie', `accessToken=${accessToken}`)
        .set('User-Agent', 'test-agent')
        .send({ fullName: 'Jane Updated' });

      expect(response.status).toBe(200);
      expect(response.body.data.fullName).toBe('Jane Updated');
    });

    it('should reject names that are too short', async () => {
      const registerResponse = await registerUser(uniqueEmail('profile-short'));
      const accessToken = registerResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .patch('/api/v1/auth/me')
        .set('Cookie', `accessToken=${accessToken}`)
        .set('User-Agent', 'test-agent')
        .send({ fullName: 'J' });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/me')
        .set('User-Agent', 'test-agent')
        .send({ fullName: 'Jane Updated' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should rotate the refresh token and issue a new access token', async () => {
      const registerResponse = await registerUser(uniqueEmail('refresh'));
      const oldRefreshToken = registerResponse.body.data.tokens.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${oldRefreshToken}`)
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).not.toBe(oldRefreshToken);

      // The old refresh token must now be revoked.
      const replay = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${oldRefreshToken}`)
        .set('User-Agent', 'test-agent');

      expect(replay.status).toBe(401);
    });

    it('should keep the rotated refresh token usable', async () => {
      const registerResponse = await registerUser(uniqueEmail('refresh-rotate'));
      const firstRefresh = registerResponse.body.data.tokens.refreshToken;

      const first = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${firstRefresh}`)
        .set('User-Agent', 'test-agent');

      const second = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${first.body.data.tokens.refreshToken}`)
        .set('User-Agent', 'test-agent');

      expect(second.status).toBe(200);
      expect(second.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });

    it('should return 401 when the refresh cookie is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should revoke the refresh token on logout', async () => {
      const registerResponse = await registerUser(uniqueEmail('logout'));
      const refreshToken = registerResponse.body.data.tokens.refreshToken;

      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .set('User-Agent', 'test-agent');

      expect(logoutResponse.status).toBe(200);

      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .set('User-Agent', 'test-agent');

      expect(refreshResponse.status).toBe(401);
    });

    it('should succeed even without a refresh cookie', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/google', () => {
    it('should register a new user from a verified Google profile', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          json: async () => ({
            email: `google-${Date.now()}@example.com`,
            name: 'Google User',
            picture: 'https://example.com/avatar.png',
          }),
        })),
      );

      const response = await request(app)
        .post('/api/v1/auth/google')
        .set('User-Agent', 'test-agent')
        .send({ accessToken: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toContain('google-');
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should login an existing user with the same Google email', async () => {
      const email = uniqueEmail('google-existing');
      await registerUser(email);

      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          json: async () => ({ email, name: 'Google User' }),
        })),
      );

      const response = await request(app)
        .post('/api/v1/auth/google')
        .set('User-Agent', 'test-agent')
        .send({ accessToken: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe(email);
    });

    it('should return 401 when Google rejects the token', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: false, json: async () => ({}) })),
      );

      const response = await request(app)
        .post('/api/v1/auth/google')
        .set('User-Agent', 'test-agent')
        .send({ accessToken: 'bad-google-token' });

      expect(response.status).toBe(401);
    });

    it('should return 401 when Google is unreachable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('network down');
        }),
      );

      const response = await request(app)
        .post('/api/v1/auth/google')
        .set('User-Agent', 'test-agent')
        .send({ accessToken: 'any-token' });

      expect(response.status).toBe(401);
    });

    it('should return 401 when the Google profile has no email', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          json: async () => ({ name: 'No Email' }),
        })),
      );

      const response = await request(app)
        .post('/api/v1/auth/google')
        .set('User-Agent', 'test-agent')
        .send({ accessToken: 'valid-google-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1', () => {
    it('should return service info', async () => {
      const response = await request(app)
        .get('/api/v1')
        .set('User-Agent', 'test-agent');

      expect(response.status).toBe(200);
      expect(response.body.data.service).toBe('StreakFlow API');
      expect(response.body.data.version).toBe('v1');
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
