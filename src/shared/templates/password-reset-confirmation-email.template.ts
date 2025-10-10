import { format } from 'date-fns';

export interface IPasswordResetConfirmationEmailTemplateInput {
  name: string;
}

export function passwordResetConfirmationEmailTemplate({
  name,
}: IPasswordResetConfirmationEmailTemplateInput): string {
  const currentDate = format(new Date(), 'PPpp');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed Successfully</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #171717;
          background-color: #fafafa;
          margin: 0;
          padding: 24px 16px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
        }
        .header {
          padding: 40px 32px 32px;
          border-bottom: 1px solid #e5e5e5;
        }
        .header h1 {
          color: #171717;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .content {
          padding: 32px;
        }
        .success-icon {
          text-align: center;
          margin-bottom: 24px;
        }
        .success-icon svg {
          width: 48px;
          height: 48px;
        }
        .greeting {
          font-size: 16px;
          color: #171717;
          margin-bottom: 16px;
        }
        .message {
          font-size: 14px;
          color: #525252;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        .info-box {
          background-color: #f5f5f5;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          padding: 16px;
          margin: 24px 0;
        }
        .info-box p {
          font-size: 13px;
          color: #525252;
          margin: 4px 0;
        }
        .info-box strong {
          color: #171717;
        }
        .security-notice {
          background-color: #fef9c3;
          border: 1px solid #fde047;
          border-radius: 6px;
          padding: 16px;
          margin-top: 24px;
        }
        .security-notice p {
          font-size: 13px;
          color: #713f12;
          margin: 0;
        }
        .footer {
          background-color: #fafafa;
          padding: 24px 32px;
          border-top: 1px solid #e5e5e5;
        }
        .footer p {
          font-size: 12px;
          color: #737373;
          margin: 4px 0;
        }
        @media (max-width: 600px) {
          body {
            padding: 16px 8px;
          }
          .header,
          .content,
          .footer {
            padding-left: 24px;
            padding-right: 24px;
          }
        }
      </style>
    </head>
    <body role="article" aria-label="Password reset confirmation">
      <main class="container">
        <header class="header">
          <h1>Password Changed Successfully</h1>
        </header>
        <section class="content">
          <div class="success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#22c55e" stroke-width="2"/>
              <path d="M8 12l2 2 4-4" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="greeting">Hi <strong>${name}</strong>,</p>
          <p class="message">
            This is a confirmation that your password has been successfully changed.
          </p>
          <div class="info-box">
            <p><strong>Date and time:</strong> ${currentDate}</p>
          </div>
          <div class="security-notice" role="note">
            <p>
              <strong>Security notice:</strong> If you didn't make this change, please contact our support team immediately.
            </p>
          </div>
        </section>
        <footer class="footer">
          <p>&copy; ${new Date().getFullYear()} Node.js API. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </footer>
      </main>
    </body>
    </html>
  `.trim();
}
