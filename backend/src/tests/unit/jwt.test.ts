import { describe, it, expect } from 'vitest';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../errors/app-error.js';

describe('JWT Utils', () => {
  const mockPayload = {
    sub: 'user123',
    email: 'test@example.com',
  };

  describe('signAccessToken', () => {
    it('should sign an access token', () => {
      const token = signAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('signRefreshToken', () => {
    it('should sign a refresh token', () => {
      const token = signRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = signAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.exp).toBeDefined();
    });

    it('should reject a token signed with the refresh secret', () => {
      const refreshToken = signRefreshToken(mockPayload);

      expect(() => verifyAccessToken(refreshToken)).toThrow(AppError);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow(AppError);
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyAccessToken('not.a.jwt')).toThrow(AppError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = signRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.exp).toBeDefined();
    });

    it('should reject a token signed with the access secret', () => {
      const accessToken = signAccessToken(mockPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow(AppError);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow(AppError);
    });
  });
});
