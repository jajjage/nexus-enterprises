import { Resend } from "resend";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  bcc?: string[];
  replyTo?: string;
};

export type EmailContext = {
  event: string;
  recipient?: string;
  orderNumber?: string;
};

export type EmailSendResult =
  | { sent: true; id?: string | null }
  | { sent: false; reason: string };

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export function getEmailSenderConfig() {
  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const from =
    configuredFrom ||
    (process.env.NODE_ENV === "production"
      ? undefined
      : "Nexus Enterprises <onboarding@resend.dev>");
  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  return { from, replyTo };
}

function logSkip(reason: string, context: EmailContext) {
  const level = process.env.NODE_ENV === "production" ? "error" : "warn";
  console[level]("[mailer] send skipped", { reason, ...context });
}

export async function sendEmailBestEffort(
  payload: EmailPayload,
  context: EmailContext,
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    const reason = "RESEND_API_KEY missing";
    logSkip(reason, context);
    return { sent: false, reason };
  }

  const { from, replyTo: configuredReplyTo } = getEmailSenderConfig();
  if (!from) {
    const reason = "RESEND_FROM_EMAIL missing";
    logSkip(reason, context);
    return { sent: false, reason };
  }

  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from,
      to: payload.to,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo ?? configuredReplyTo,
    });

    if (response.error) {
      console.error("[mailer] send failed", {
        ...context,
        error: response.error,
      });
      return { sent: false, reason: String(response.error.message || "Resend error") };
    }

    console.info("[mailer] email sent", {
      ...context,
      id: response.data?.id,
    });
    return { sent: true, id: response.data?.id };
  } catch (error) {
    console.error("[mailer] send failed", { ...context, error });
    return { sent: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}
