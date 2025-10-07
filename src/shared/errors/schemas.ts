import { z } from 'zod';
import { ErrorCode } from './error-codes.ts';

const errorDetailSchema = z.record(z.string(), z.unknown());

export type IAppErrorDetails = z.infer<typeof errorDetailSchema>;

export const errorCodeSchema = z.union([z.enum(ErrorCode), z.string()]);

export const appErrorResponseSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  details: errorDetailSchema.optional(),
  stack: z.string().optional(),
});

export type IAppErrorResponse = z.infer<typeof appErrorResponseSchema>;
