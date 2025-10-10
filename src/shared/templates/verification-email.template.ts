export interface IVerificationEmailTemplateInput {
  name: string;
  verificationUrl: string;
}

export function verificationEmailTemplate({
  name,
  verificationUrl,
}: IVerificationEmailTemplateInput): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
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
        .button-container {
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #171717;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #404040;
        }
        .button:focus {
          outline: 2px solid #171717;
          outline-offset: 2px;
        }
        .divider {
          margin: 32px 0;
          border: none;
          border-top: 1px solid #e5e5e5;
        }
        .alternative-link {
          font-size: 13px;
          color: #737373;
          line-height: 1.6;
        }
        .alternative-link a {
          color: #3b82f6;
          text-decoration: none;
          word-break: break-all;
        }
        .alternative-link a:hover {
          text-decoration: underline;
        }
        .note {
          font-size: 13px;
          color: #a3a3a3;
          margin-top: 32px;
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
    <body role="article" aria-label="Email verification">
      <main class="container">
        <header class="header">
          <h1>Verify Your Email</h1>
        </header>
        <section class="content">
          <p class="greeting">Hi <strong>${name}</strong>,</p>
          <p class="message">
            Thanks for signing up! Please verify your email address to complete your registration and start using your account.
          </p>
          <div class="button-container">
            <a href="${verificationUrl}" class="button" role="button" aria-label="Verify email address">
              Verify Email Address
            </a>
          </div>
          <hr class="divider" aria-hidden="true" />
          <p class="alternative-link">
            If the button above doesn't work, copy and paste this link into your browser:<br />
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p class="note">
            If you didn't create an account, you can safely ignore this email.
          </p>
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
