import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Factory function — takes a schema, returns a middleware
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

if (!result.success) {
  const errors = result.error.issues.map(e => ({
    field: e.path.join('.'),
    message: e.message
  }));
  res.status(400).json({ message: 'Validation failed', errors });
  return;
}

    // Replace req.body with the validated + typed data
    req.body = result.data;
    next();
  };
};