import { describe, it, expect } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { sanitizeInput } from '../../middlewares/sanitize.js';

const run = (body: unknown, query: unknown = {}, params: unknown = {}) => {
  const req = {
    body,
    query,
    params,
    id: 'test-req-id',
  } as unknown as Request;

  let error: unknown;
  let nextCalled = false;
  const next: NextFunction = (err?: unknown) => {
    if (err) {
      error = err;
    }
    nextCalled = true;
  };

  sanitizeInput(req, {} as Response, next);
  return { req, nextCalled, error };
};

describe('sanitizeInput middleware', () => {
  it('should remove angle brackets from strings', () => {
    const { req, nextCalled } = run({ name: '<script>alert(1)</script>' });

    expect(nextCalled).toBe(true);
    expect(req.body.name).toBe('scriptalert(1)/script');
  });

  it('should remove javascript: protocol', () => {
    const { req } = run({ url: 'javascript:alert(1)' });

    expect(req.body.url).toBe('alert(1)');
  });

  it('should remove inline event handlers', () => {
    const { req } = run({ html: '<img onclick=steal()>' });

    expect(req.body.html).not.toContain('onclick=');
  });

  it('should sanitize nested objects and arrays', () => {
    const { req } = run({
      nested: { value: '<b>' },
      list: ['x<y', { deep: 'onload=' }],
    });

    expect(req.body.nested.value).toBe('b');
    expect(req.body.list[0]).toBe('xy');
    expect(req.body.list[1].deep).not.toContain('onload=');
  });

  it('should leave clean values untouched', () => {
    const payload = { name: 'Morning Run', count: 3, active: true };

    const { req } = run(payload);

    expect(req.body).toEqual(payload);
  });

  it('should pass through non-string primitives', () => {
    const { req } = run({ count: 0, flag: false, empty: null });

    expect(req.body.count).toBe(0);
    expect(req.body.flag).toBe(false);
    expect(req.body.empty).toBeNull();
  });
});
