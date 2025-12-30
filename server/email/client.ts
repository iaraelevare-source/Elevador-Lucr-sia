/**
 * 📧 Cliente de Email - Elevare
 * Suporte para SendGrid e Resend com fallback automático
 */

import { logger } from "../adapters/loggingAdapter";

// ==================== TYPES ====================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
}

type EmailProvider = "sendgrid" | "resend" | "mock";

// ==================== CONFIG ====================

const DEFAULT_FROM = process.env.EMAIL_FROM || "Elevare <noreply@elevare.app>";

function getProvider(): EmailProvider {
  if (process.env.SENDGRID_API_KEY) return "sendgrid";
  if (process.env.RESEND_API_KEY) return "resend";
  return "mock";
}

// ==================== PROVIDERS ====================

async function sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return { success: false, error: "SENDGRID_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: extractEmail(options.from || DEFAULT_FROM), name: extractName(options.from || DEFAULT_FROM) },
        subject: options.subject,
        content: [
          { type: "text/plain", value: options.text || stripHtml(options.html) },
          { type: "text/html", value: options.html },
        ],
      }),
    });

    if (response.ok || response.status === 202) {
      const messageId = response.headers.get("x-message-id") || `sg-${Date.now()}`;
      logger.info("Email sent via SendGrid", { to: options.to, subject: options.subject, messageId });
      return { success: true, messageId, provider: "sendgrid" };
    }

    const errorText = await response.text();
    logger.error("SendGrid error", { status: response.status, error: errorText });
    return { success: false, error: `SendGrid error: ${response.status}`, provider: "sendgrid" };
  } catch (error) {
    logger.error("SendGrid request failed", error);
    return { success: false, error: String(error), provider: "sendgrid" };
  }
}

async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
      }),
    });

    if (response.ok) {
      const data = await response.json() as { id?: string };
      logger.info("Email sent via Resend", { to: options.to, subject: options.subject, messageId: data.id });
      return { success: true, messageId: data.id, provider: "resend" };
    }

    const errorData = await response.json() as { message?: string };
    logger.error("Resend error", { status: response.status, error: errorData });
    return { success: false, error: errorData.message || `Resend error: ${response.status}`, provider: "resend" };
  } catch (error) {
    logger.error("Resend request failed", error);
    return { success: false, error: String(error), provider: "resend" };
  }
}

async function sendWithMock(options: EmailOptions): Promise<EmailResult> {
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  console.log("\n" + "=".repeat(60));
  console.log("📧 [MOCK EMAIL] - Development Mode");
  console.log("=".repeat(60));
  console.log(`To: ${options.to}`);
  console.log(`From: ${options.from || DEFAULT_FROM}`);
  console.log(`Subject: ${options.subject}`);
  console.log("-".repeat(60));
  console.log("HTML Preview (first 500 chars):");
  console.log(options.html.slice(0, 500));
  console.log("=".repeat(60) + "\n");

  logger.info("Mock email sent", { to: options.to, subject: options.subject, messageId });
  return { success: true, messageId, provider: "mock" };
}

// ==================== HELPERS ====================

function extractEmail(from: string): string {
  const match = from.match(/<(.+)>/);
  return match ? match[1] : from;
}

function extractName(from: string): string {
  const match = from.match(/^(.+)\s*</);
  return match ? match[1].trim() : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ==================== MAIN EXPORT ====================

/**
 * Enviar email usando o provider configurado
 * Detecta automaticamente: SendGrid > Resend > Mock
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = getProvider();
  
  logger.info("Sending email", { 
    provider, 
    to: options.to, 
    subject: options.subject 
  });

  switch (provider) {
    case "sendgrid":
      return sendWithSendGrid(options);
    case "resend":
      return sendWithResend(options);
    case "mock":
    default:
      return sendWithMock(options);
  }
}

/**
 * Verificar configuração de email
 */
export function getEmailConfig() {
  const provider = getProvider();
  return {
    provider,
    configured: provider !== "mock",
    defaultFrom: DEFAULT_FROM,
  };
}
