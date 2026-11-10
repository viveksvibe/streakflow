import { describe, it, expect } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { requestId } from '../../middlewares/request-id.js';

const run = (headers: Record<string, unknown>) => {
  const req = { headers } as unknown as Request;
  const next: NextFunction = () => undefined;
  requestId(req, {} as Response, next);
  return req;
};

describe('requestId middleware', () => {
  it('should generate a UUID when no header is present', () => {
    const req = run({});

    expect(req.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should trust a well-formed x-request-id header', () => {
    const req = run({ 'x-request-id': 'trace-123' });

    expect(req.id).toBe('trace-123');
  });

  it('should strip control characters and special characters', () => {
    const req = run({ 'x-request-id': 'trace\n injected log line' });

    expect(req.id).toBe('traceinjectedlogline');
  });

  it('should cap the id length', () => {
    const req = run({ 'x-request-id': 'x'.repeat(500) });

    expect(req.id).toHaveLength(64);
  });

  it('should fall back to a UUID for unusable header values', () => {
    const req = run({ 'x-request-id': '   ' });

    expect(req.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
