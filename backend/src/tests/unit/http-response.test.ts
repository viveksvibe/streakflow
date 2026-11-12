import { describe, it, expect } from 'vitest';
import type { Response } from 'express';
import { sendSuccess } from '../../utils/http-response.js';

const createMockRes = (requestId = 'req-1') => {
  const state = {
    statusCode: 0,
    body: null as unknown,
    requestId,
  };

  const res = {
    req: { id: requestId },
    status(code: number) {
      state.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      state.body = payload;
      return res;
    },
  } as unknown as Response;

  return { res, state };
};

describe('sendSuccess', () => {
  it('should send the documented success envelope', () => {
    const { res, state } = createMockRes();

    sendSuccess(res, 201, { id: 'abc' }, 'Created');

    expect(state.statusCode).toBe(201);
    expect(state.body).toMatchObject({
      success: true,
      message: 'Created',
      data: { id: 'abc' },
      requestId: 'req-1',
    });
  });

  it('should default message to undefined and include requestId', () => {
    const { res, state } = createMockRes('custom-id');

    sendSuccess(res, 200, null);

    expect(state.statusCode).toBe(200);
    expect(state.body).toMatchObject({
      success: true,
      data: null,
      requestId: 'custom-id',
    });
    expect((state.body as { message?: string }).message).toBeUndefined();
  });
});
