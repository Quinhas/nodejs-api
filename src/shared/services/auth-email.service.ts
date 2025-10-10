import type { IEmailService } from '../../core/types/services/email.service.ts';
import { env } from '../../env.ts';
import { passwordResetConfirmationEmailTemplate } from '../templates/password-reset-confirmation-email.template.ts';
import { resetPasswordEmailTemplate } from '../templates/reset-password-email.template.ts';
import { verificationEmailTemplate } from '../templates/verification-email.template.ts';

export interface ISendVerificationEmailInput {
  to: string;
  name: string;
  verificationUrl: string;
}

export interface ISendResetPasswordEmailInput {
  to: string;
  name: string;
  resetUrl: string;
}

export interface ISendPasswordResetConfirmationEmailInput {
  to: string;
  name: string;
}

export interface IAuthEmailServiceOutput {
  id: string;
}

export interface IAuthEmailService {
  sendVerificationEmail(
    input: ISendVerificationEmailInput
  ): Promise<IAuthEmailServiceOutput>;
  sendResetPasswordEmail(
    input: ISendResetPasswordEmailInput
  ): Promise<IAuthEmailServiceOutput>;
  sendPasswordResetConfirmation(
    input: ISendPasswordResetConfirmationEmailInput
  ): Promise<IAuthEmailServiceOutput>;
}

export interface IAuthEmailServiceDeps {
  emailService: IEmailService;
}

export class AuthEmailService implements IAuthEmailService {
  private emailService;

  constructor({ emailService }: IAuthEmailServiceDeps) {
    this.emailService = emailService;
  }

  async sendVerificationEmail(
    input: ISendVerificationEmailInput
  ): Promise<IAuthEmailServiceOutput> {
    const html = verificationEmailTemplate({
      name: input.name,
      verificationUrl: input.verificationUrl,
    });

    if (!env.EMAIL_FROM) {
      throw Error('EMAIL_FROM is not defined.');
    }

    const result = await this.emailService.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: 'Verify Your Email Address',
      html,
    });

    return {
      id: result.id,
    };
  }

  async sendResetPasswordEmail(
    input: ISendResetPasswordEmailInput
  ): Promise<IAuthEmailServiceOutput> {
    const html = resetPasswordEmailTemplate({
      name: input.name,
      resetUrl: input.resetUrl,
    });

    if (!env.EMAIL_FROM) {
      throw Error('EMAIL_FROM is not defined.');
    }

    const result = await this.emailService.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: 'Reset Your Password',
      html,
    });

    return {
      id: result.id,
    };
  }

  async sendPasswordResetConfirmation(
    input: ISendPasswordResetConfirmationEmailInput
  ): Promise<IAuthEmailServiceOutput> {
    const html = passwordResetConfirmationEmailTemplate({
      name: input.name,
    });

    if (!env.EMAIL_FROM) {
      throw Error('EMAIL_FROM is not defined.');
    }

    const result = await this.emailService.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: 'Password Changed Successfully',
      html,
    });

    return {
      id: result.id,
    };
  }
}
