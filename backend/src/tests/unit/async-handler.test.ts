import { describe, it, expect } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';

const fakeReq = {} as Request;
const fakeRes = {} as Response;

describe('asyncHandler', () => {
  it('should call the handler with req, res, next', async () => {
    let called = 0;
    const next = () => {
      called += 1;
    };

    const handler = asyncHandler(async (req, res, nxt) => {
      expect(req).toBe(fakeReq);
      expect(res).toBe(fakeRes);
      expect(nxt).toBe(next);
    });

    handler(fakeReq, fakeRes, next);
    expect(called).toBe(0); // async handler has not resolved yet
  });

  it('should forward rejected promises to next', async () => {
    expect.assertions(1);

    const failure = new Error('boom');
    const next: NextFunction = (error) => {
      expect(error).toBe(failure);
    };

    const handler = asyncHandler(async () => {
      throw failure;
    });

    handler(fakeReq, fakeRes, next);
  });

  it('should not throw when the handler resolves', async () => {
    const next: NextFunction = () => {
      throw new Error('next should not be called');
    };

    const handler = asyncHandler(async () => 'ok');
    await expect(
      new Promise<void>((resolve, reject) => {
        try {
          handler(fakeReq, fakeRes, next);
          resolve();
        } catch (error) {
          reject(error);
        }
      }),
    ).resolves.toBeUndefined();
  });
});
