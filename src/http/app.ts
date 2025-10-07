import fastifyAutoload from '@fastify/autoload';
import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import path from 'path';
import { generateId } from '../shared/helpers/id.helper.ts';
import { logger } from '../shared/logger.ts';
import { errorHandler } from './error-handler.ts';
import { notFoundHandler } from './not-found-error-handler.ts';
import { routes } from './routes/index.ts';

const app = fastify({
  loggerInstance: logger,
  genReqId: generateId,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

app.register(fastifyAutoload, {
  dir: path.join(import.meta.dirname, 'plugins'),
  dirNameRoutePrefix: false,
  forceESM: true,
});

app.register(routes);

type IApp = typeof app;
export { app, type IApp };
