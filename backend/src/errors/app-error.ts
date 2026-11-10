// AUDIT FIX [7.3]: Fix AppError prototype inheritance across transpilation targets
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

