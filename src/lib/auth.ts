import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { db } from '../database/client.ts';
import { schema } from '../database/schema/index.ts';
import { env } from '../env.ts';
import { generateId } from '../shared/helpers/id.helper.ts';
import { logger } from '../shared/logger.ts';
import { PasswordHashService } from '../shared/services/argon-password-hash.service.ts';
import { AuthEmailService } from '../shared/services/auth-email.service.ts';
import { ResendEmailService } from '../shared/services/resend-email.service.ts';

const passwordHashService = new PasswordHashService();
const emailService = new ResendEmailService();
const authEmailService = new AuthEmailService({ emailService });

const INTERVAL_15_MINUTES = 60 * 15;
const INTERVAL_1_DAY = 60 * 60 * 24;

export const auth = betterAuth({
  basePath: '/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGIN,
  database: drizzleAdapter(db, {
    camelCase: false,
    schema: schema,
    provider: 'pg',
    usePlural: true,
  }),
  logger: {
    log(level, message, ...args) {
      logger[level](args, `[auth] ${message}`);
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    disableSignUp: false,
    resetPasswordTokenExpiresIn: INTERVAL_15_MINUTES,
    password: {
      async hash(password: string) {
        const result = await passwordHashService.hash({ password });
        return result.hash;
      },
      async verify({ password, hash }) {
        const result = await passwordHashService.verify({ password, hash });
        return result.isValid;
      },
    },
    sendResetPassword: async ({ user, url }) => {
      await authEmailService.sendResetPasswordEmail({
        to: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
    onPasswordReset: async ({ user }) => {
      await authEmailService.sendPasswordResetConfirmation({
        to: user.email,
        name: user.name,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await authEmailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: url,
      });
    },
    expiresIn: INTERVAL_1_DAY,
    sendOnSignUp: true,
    sendOnSignIn: true,
  },
  advanced: {
    cookiePrefix: 'nodejs-api',
    database: {
      generateId: generateId,
    },
  },
  plugins: [openAPI({ disableDefaultReference: true })],
});
