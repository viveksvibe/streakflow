import { describe, it, expect } from 'vitest';
import { AppError } from '../../errors/app-error.js';

describe('AppError', () => {
  it('should default to status code 500', () => {
    const error = new AppError('Something broke');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Something broke');
    expect(error.name).toBe('AppError');
  });

  it('should accept a custom status code', () => {
    const error = new AppError('Not here', 404);

    expect(error.statusCode).toBe(404);
  });

  it('should carry optional details', () => {
    const details = { field: 'email' };
    const error = new AppError('Bad input', 422, details);

    expect(error.details).toEqual(details);
  });

  it('should leave details undefined when not provided', () => {
    const error = new AppError('Bad input', 422);

    expect(error.details).toBeUndefined();
  });
});
