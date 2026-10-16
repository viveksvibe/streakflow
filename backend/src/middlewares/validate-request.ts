import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    schema.parse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
      cookie: req.cookies ?? {}
    });
    next();
  };
};
