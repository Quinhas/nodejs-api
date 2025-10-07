import { ErrorCode } from '../../shared/errors/error-codes.ts';
import {
  appErrorResponseSchema,
  errorCodeSchema,
} from '../../shared/errors/schemas.ts';

export const internalServerErrorSchema = appErrorResponseSchema
  .extend({
    code: errorCodeSchema.default(ErrorCode.INTERNAL_SERVER_ERROR),
  })
  .describe(
    'Internal Server Error. This is a problem with the server that you cannot fix.'
  );

export const unauthorizedErrorSchema = appErrorResponseSchema
  .extend({
    code: errorCodeSchema.default(ErrorCode.UNAUTHORIZED),
  })
  .describe('Unauthorized. Due to missing or invalid authentication.');

export const forbiddenErrorSchema = appErrorResponseSchema
  .extend({
    code: errorCodeSchema.default(ErrorCode.FORBIDDEN),
  })
  .describe(
    'Forbidden. You do not have permission to access this resource or to perform this action.'
  );

export const badRequestErrorSchema = appErrorResponseSchema
  .extend({
    code: errorCodeSchema.default(ErrorCode.BAD_REQUEST),
  })
  .describe('Bad Request. Usually due to missing or invalid parameters.');

export const conflictErrorSchema = appErrorResponseSchema
  .extend({
    code: errorCodeSchema.default(ErrorCode.CONFLICT),
  })
  .describe(
    'Conflict. The request conflicts with the current state of the server.'
  );
