import { Resend } from 'resend';
import type {
  IEmailService,
  ISendEmailInput,
  ISendEmailOutput,
} from '../../core/types/services/email.service.ts';
import { env } from '../../env.ts';
import { AppError } from '../errors/app-error.ts';

export class ResendEmailService implements IEmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async send(input: ISendEmailInput): Promise<ISendEmailOutput> {
    const { data, error } = await this.resend.emails.send({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      throw AppError.internal({
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send email',
        previous: error,
      });
    }

    return {
      id: data.id,
    };
  }
}
