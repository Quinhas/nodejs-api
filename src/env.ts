import z from 'zod';

export const nodeEnvSchema = z.enum(['development', 'test', 'production']);

export type INodeEnv = z.infer<typeof nodeEnvSchema>;

const envSchema = z.object({
  npm_package_name: z.string().optional().default('unknown'),
  npm_package_version: z.string().optional().default('0.0.0'),
  npm_package_description: z.string().optional().default('No description'),

  NODE_ENV: nodeEnvSchema.default('development'),
  TZ: z.string().default('America/Sao_Paulo'),
  PORT: z.coerce.number().default(3333),

  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string(),
  DATABASE_URL: z.url().startsWith('postgresql://'),

  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(',').map((origin) => origin.trim()))
    .pipe(z.array(z.url()))
    .optional(),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_TIME_WINDOW: z.string().default('1 minute'),
  RATE_LIMIT_BAN: z.coerce.number().optional(),

  SANITIZE_ENABLED: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .default('true')
    .transform((val) => val === true || val === 'true')
    .pipe(z.boolean()),
});

export type IEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
