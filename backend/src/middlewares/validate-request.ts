import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
      cookie: req.cookies ?? {}
    }) as { body?: unknown };

    // Apply the schema's transforms (trim, defaults, coercion) so
    // controllers/services always receive normalized values.
    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    next();
  };
};
