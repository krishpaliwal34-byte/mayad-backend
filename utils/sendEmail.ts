
import nodemailer from "nodemailer";

interface SendArtistCredentialsEmailParams {
  toEmail: string;
  artistName: string;
  temporaryPassword: string;
  loginLink: string;
}

interface SendInvitationEmailParams {
  toEmail: string;
  artistName: string;
  inviteLink: string;
}

const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP environment variables are missing");
  }

  const port = Number(SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// Escape user-provided values before inserting them into HTML.
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

// 1. Send new artist account credentials
export const sendArtistCredentialsEmail = async ({
  toEmail,
  artistName,
  temporaryPassword,
  loginLink,
}: SendArtistCredentialsEmailParams) => {
  const transporter = createTransporter();

  const safeName = escapeHtml(artistName);
  const safeEmail = escapeHtml(toEmail);
  const safePassword = escapeHtml(temporaryPassword);
  const safeLoginLink = escapeHtml(loginLink);

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: toEmail,

    subject: "MAYAD Artist Portal - Your Login Credentials",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #222;">

        <h2 style="color: #111;">
          Welcome to MAYAD Artist Portal
        </h2>

        <p>Hello ${safeName},</p>

        <p>
          Your MAYAD Artist Portal account has been created
          by the administration.
        </p>

        <h3>Your Login Credentials</h3>

        <div style="background: #f4f4f4; padding: 18px; border-radius: 8px;">
          <p>
            <strong>Email:</strong> ${safeEmail}
          </p>

          <p>
            <strong>Temporary Password:</strong>
            ${safePassword}
          </p>
        </div>

        <p>
          Please log in using the credentials above.
          You will be required to change your temporary
          password during your first login.
        </p>

        <a
          href="${safeLoginLink}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #111;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 12px;
          "
        >
          Login to Artist Portal
        </a>

        <p>
          Your account will remain pending until it is
          approved by the MAYAD administration.
        </p>

        <p>
          For security reasons, do not share your
          temporary password with anyone.
        </p>

        <p>Regards,<br />MAYAD Team</p>

      </div>
    `,
  });

  return { sent: true };
};

// 2. Keep existing invitation email function
// This prevents errors in the existing artistController.ts
export const sendInvitationEmail = async ({
  toEmail,
  artistName,
  inviteLink,
}: SendInvitationEmailParams) => {
  const transporter = createTransporter();

  const safeName = escapeHtml(artistName);
  const safeInviteLink = escapeHtml(inviteLink);

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: toEmail,

    subject: "MAYAD Artist Portal - Invitation",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">

        <h2>Welcome to MAYAD</h2>

        <p>Hello ${safeName},</p>

        <p>
          You have been invited to join the MAYAD Artist Portal.
        </p>

        <p>
          Click the button below to continue.
        </p>

        <a
          href="${safeInviteLink}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #111;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Accept Invitation
        </a>

        <p>Regards,<br />MAYAD Team</p>

      </div>
    `,
  });

  return { sent: true };
};
