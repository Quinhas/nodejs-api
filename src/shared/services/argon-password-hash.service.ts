import argon2 from 'argon2';
import type {
  IPasswordHashService,
  IPasswordHashServiceHashInput,
  IPasswordHashServiceHashOutput,
  IPasswordHashServiceVerifyInput,
  IPasswordHashServiceVerifyOutput,
} from '../../core/types/services/password-hash.service.ts';
import { AppError } from '../errors/app-error.ts';

const MAX_PASSWORD_LENGTH = 128;

export class PasswordHashService implements IPasswordHashService {
  private readonly argon2Options = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  };

  async hash(
    input: IPasswordHashServiceHashInput
  ): Promise<IPasswordHashServiceHashOutput> {
    this.validatePassword(input.password);

    try {
      const hash = await argon2.hash(input.password, this.argon2Options);

      return {
        hash,
      };
    } catch (error) {
      throw AppError.internal({
        code: 'PASSWORD_HASH_FAILED',
        message: 'Failed to hash password',
        previous: error instanceof Error ? error : undefined,
      });
    }
  }

  async verify(
    input: IPasswordHashServiceVerifyInput
  ): Promise<IPasswordHashServiceVerifyOutput> {
    this.validatePassword(input.password);

    try {
      const isValid = await argon2.verify(input.hash, input.password);

      return {
        isValid,
      };
    } catch (error) {
      throw AppError.internal({
        code: 'PASSWORD_VERIFY_FAILED',
        message: 'Failed to verify password',
        previous: error instanceof Error ? error : undefined,
      });
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length === 0) {
      throw AppError.badRequest({
        code: 'PASSWORD_EMPTY',
        message: 'Password cannot be empty',
      });
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      throw AppError.badRequest({
        code: 'PASSWORD_TOO_LONG',
        message: `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`,
        details: { maxLength: MAX_PASSWORD_LENGTH },
      });
    }
  }
}
