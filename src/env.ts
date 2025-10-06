import z from 'zod';

export const nodeEnvSchema = z.enum(['development', 'test', 'production']);

export type INodeEnv = z.infer<typeof nodeEnvSchema>;

const envSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('development'),
  TZ: z.string().default('America/Sao_Paulo'),
  PORT: z.coerce.number().default(3333),

  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string(),
  DATABASE_URL: z.url().startsWith('postgresql://'),
});

export const env = envSchema.parse(process.env);
