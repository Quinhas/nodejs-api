export interface ISendEmailInput {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export interface ISendEmailOutput {
  id: string;
}

export interface IEmailService {
  send(input: ISendEmailInput): Promise<ISendEmailOutput>;
}
