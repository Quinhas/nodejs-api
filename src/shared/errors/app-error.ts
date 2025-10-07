import { env } from '../../env.ts';
import { ErrorCode, type IErrorCodeKeys } from './error-codes.ts';
import type { IAppErrorDetails, IAppErrorResponse } from './schemas.ts';

export interface IAppErrorOptions {
  code: IErrorCodeKeys | string;
  message: string;
  statusCode?: number;
  details?: IAppErrorDetails;
  previous?: Error;
}

const APP_ERROR_SYMBOL = Symbol.for('app.error');

export class AppError extends Error {
  private readonly [APP_ERROR_SYMBOL] = true;
  public readonly code: IErrorCodeKeys | string;
  public readonly statusCode: number;
  public readonly details?: IAppErrorDetails;
  public readonly previous?: Error;

  constructor({
    code,
    message,
    statusCode = 400,
    details,
    previous,
  }: IAppErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.previous = previous;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): IAppErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.getStack(),
    };
  }

  private getStack() {
    if (env.NODE_ENV === 'production') return undefined;
    return this.previous ? this.previous.stack : this.stack;
  }

  static badRequest({
    code = ErrorCode.BAD_REQUEST,
    message = 'Bad request',
    statusCode = 400,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      details,
      previous,
    });
  }

  static unauthorized({
    code = ErrorCode.UNAUTHORIZED,
    message = 'Unauthorized',
    statusCode = 401,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      details,
      previous,
    });
  }

  static forbidden({
    code = ErrorCode.FORBIDDEN,
    message = 'Forbidden',
    statusCode = 403,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      details,
      previous,
    });
  }

  static notFound({
    code = ErrorCode.NOT_FOUND,
    message = 'Not found',
    statusCode = 404,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      details,
      previous,
    });
  }

  static tooManyRequests({
    code = ErrorCode.TOO_MANY_REQUESTS,
    message = 'Too many requests',
    statusCode = 429,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      details,
      previous,
    });
  }

  static conflict({
    code = ErrorCode.CONFLICT,
    message = 'Conflict',
    statusCode = 409,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      details,
      previous,
    });
  }

  static internal({
    code = ErrorCode.INTERNAL_SERVER_ERROR,
    message = 'Internal server error',
    statusCode = 500,
    details,
    previous,
  }: Partial<IAppErrorOptions> = {}): AppError {
    return new AppError({
      code,
      statusCode,
      message,
      previous,
      details,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof AppError ||
    (typeof error === 'object' && error !== null && APP_ERROR_SYMBOL in error)
  );
}
