/**
 * Email Client - Suporte para SendGrid e Resend
 * 
 * Configuração via ENV:
 * - SENDGRID_API_KEY: Para usar SendGrid
 * - RESEND_API_KEY: Para usar Resend
 * - EMAIL_FROM: Email remetente (ex: noreply@elevare.ai)
 * - EMAIL_FROM_NAME: Nome do remetente (ex: Elevare AI)
 */

import { logger } from "../../server/_core/logger";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * SendGrid Provider
 */
class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3/mail/send';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const from = options.from || process.env.EMAIL_FROM || 'noreply@elevare.ai';
      const fromName = options.fromName || process.env.EMAIL_FROM_NAME || 'Elevare AI';

      const recipients = Array.isArray(options.to) 
        ? options.to.map(email => ({ email }))
        : [{ email: options.to }];

      const payload = {
        personalizations: [
          {
            to: recipients,
            subject: options.subject,
          },
        ],
        from: {
          email: from,
          name: fromName,
        },
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
        ...(options.text && {
          content: [
            { type: 'text/plain', value: options.text },
            { type: 'text/html', value: options.html },
          ],
        }),
        ...(options.replyTo && {
          reply_to: {
            email: options.replyTo,
          },
        }),
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('SendGrid error', { status: response.status, error });
        return { success: false, error: `SendGrid error: ${response.status}` };
      }

      const messageId = response.headers.get('x-message-id') || undefined;
      logger.info('Email sent via SendGrid', { to: options.to, subject: options.subject, messageId });
      
      return { success: true, messageId };
    } catch (error) {
      logger.error('Failed to send email via SendGrid', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

/**
 * Resend Provider
 */
class ResendProvider implements EmailProvider {
  private apiKey: string;
  private baseUrl = 'https://api.resend.com/emails';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const from = options.from || process.env.EMAIL_FROM || 'noreply@elevare.ai';
      const fromName = options.fromName || process.env.EMAIL_FROM_NAME || 'Elevare AI';

      const payload = {
        from: `${fromName} <${from}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        ...(options.text && { text: options.text }),
        ...(options.replyTo && { reply_to: options.replyTo }),
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Resend error', { status: response.status, error: data });
        return { success: false, error: `Resend error: ${response.status}` };
      }

      logger.info('Email sent via Resend', { to: options.to, subject: options.subject, messageId: data.id });
      
      return { success: true, messageId: data.id };
    } catch (error) {
      logger.error('Failed to send email via Resend', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

/**
 * Mock Provider (para desenvolvimento)
 */
class MockProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    logger.info('[MOCK EMAIL] Email would be sent', {
      to: options.to,
      subject: options.subject,
      htmlLength: options.html.length,
    });
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}

/**
 * Email Client Factory
 */
class EmailClient {
  private provider: EmailProvider;

  constructor() {
    // Detectar provider baseado em ENV
    const sendGridKey = process.env.SENDGRID_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (sendGridKey) {
      this.provider = new SendGridProvider(sendGridKey);
      logger.info('Email client initialized with SendGrid');
    } else if (resendKey) {
      this.provider = new ResendProvider(resendKey);
      logger.info('Email client initialized with Resend');
    } else {
      this.provider = new MockProvider();
      logger.warn('No email provider configured, using mock provider');
    }
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Validações básicas
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      return { success: false, error: 'No recipients specified' };
    }

    if (!options.subject) {
      return { success: false, error: 'No subject specified' };
    }

    if (!options.html) {
      return { success: false, error: 'No HTML content specified' };
    }

    return this.provider.send(options);
  }

  /**
   * Enviar email para múltiplos destinatários (batch)
   */
  async sendBatch(emails: EmailOptions[]): Promise<{ success: boolean; results: Array<{ success: boolean; messageId?: string; error?: string }> }> {
    const results = await Promise.all(
      emails.map(email => this.send(email))
    );

    const allSuccess = results.every(r => r.success);
    
    return { success: allSuccess, results };
  }
}

// Singleton instance
export const emailClient = new EmailClient();

export async function sendEmail(options: EmailOptions) {
  return emailClient.send(options);
}

/**
 * Obter configuração atual do cliente de email
 */
export function getEmailConfig() {
  const sendGridKey = process.env.SENDGRID_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const provider = sendGridKey ? "sendgrid" : resendKey ? "resend" : "mock";

  return {
    provider,
    configured: provider !== "mock",
    defaultFrom: process.env.EMAIL_FROM || "noreply@elevare.ai",
  };
}
