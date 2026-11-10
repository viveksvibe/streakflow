import { describe, it, expect } from 'vitest';
import { hashToken } from '../../utils/token.js';

describe('Token Utils', () => {
  describe('hashToken', () => {
    it('should hash a token', () => {
      const token = 'test-token-123';
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce consistent hash for same token', () => {
      const token = 'test-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const token1 = 'test-token-123';
      const token2 = 'test-token-456';
      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce hash in hex format', () => {
      const token = 'test-token-123';
      const hash = hashToken(token);
      const hexRegex = /^[a-f0-9]+$/;

      expect(hash).toMatch(hexRegex);
    });
  });
});
