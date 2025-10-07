import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { logger } from '../shared/logger.ts';
import { errorHandler } from './error-handler.ts';
import { notFoundHandler } from './not-found-error-handler.ts';

const app = fastify({
  loggerInstance: logger,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

type IApp = typeof app;
export { app, type IApp };
