import cors from '@fastify/cors';
import fastifyPlugin from 'fastify-plugin';
import { env } from '../../env.ts';
import type { IApp } from '../app.ts';

async function corsPlugin(app: IApp) {
  await app.register(cors, {
    origin: env.NODE_ENV === 'production' ? (env.CORS_ORIGIN ?? false) : true,
    credentials: true,
  });
}

export default fastifyPlugin(corsPlugin, {
  name: 'cors',
});
