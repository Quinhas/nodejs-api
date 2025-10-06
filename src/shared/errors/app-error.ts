import { env } from '../../env.ts';

export const ErrorCode = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

export type IErrorCodeKeys = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface IAppErrorDetails {
  field?: string;
  value?: unknown;
  context?: Record<string, unknown>;
}

export interface IAppErrorOptions {
  code: IErrorCodeKeys | string;
  message: string;
  statusCode?: number;
  details?: IAppErrorDetails;
  previous?: Error;
}

export interface IAppErrorResponse {
  statusCode: number;
  code: IErrorCodeKeys | string;
  message: string;
  details?: IAppErrorDetails;
  stack?: string;
}

export class AppError extends Error {
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
      statusCode: this.statusCode,
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

  static badRequest(
    props: { message?: string; details?: IAppErrorDetails } = {}
  ): AppError {
    const { message = 'Bad request', details } = props;
    return new AppError({
      code: ErrorCode.BAD_REQUEST,
      statusCode: 400,
      message,
      details,
    });
  }

  static unauthorized(
    props: { message?: string; details?: IAppErrorDetails } = {}
  ): AppError {
    const { message = 'Unauthorized', details } = props;
    return new AppError({
      code: ErrorCode.UNAUTHORIZED,
      statusCode: 401,
      message,
      details,
    });
  }

  static forbidden(
    props: { message?: string; details?: IAppErrorDetails } = {}
  ): AppError {
    const { message = 'Forbidden', details } = props;
    return new AppError({
      code: ErrorCode.FORBIDDEN,
      statusCode: 403,
      message,
      details,
    });
  }

  static notFound(
    props: { message?: string; details?: IAppErrorDetails } = {}
  ): AppError {
    const { message = 'Not found', details } = props;
    return new AppError({
      code: ErrorCode.NOT_FOUND,
      statusCode: 404,
      message,
      details,
    });
  }

  static tooManyRequests(
    props: { message?: string; details?: IAppErrorDetails } = {}
  ): AppError {
    const { message = 'Too many requests', details } = props;
    return new AppError({
      code: ErrorCode.TOO_MANY_REQUESTS,
      statusCode: 429,
      message,
      details,
    });
  }

  static internal(
    props: {
      message?: string;
      previous?: Error;
      details?: IAppErrorDetails;
    } = {}
  ): AppError {
    const { message = 'Internal server error', previous, details } = props;
    return new AppError({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: 500,
      message,
      previous,
      details,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
