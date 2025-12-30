/**
 * 📧 Email Module - Elevare
 * Exporta todos os componentes do sistema de email
 */

export { sendEmail, getEmailConfig } from "./client";
export type { EmailOptions, EmailResult } from "./client";

export {
  welcomeEmail,
  subscriptionConfirmationEmail,
  lowCreditsEmail,
  renewalReminderEmail,
  passwordResetEmail,
} from "./templates";

export type {
  WelcomeEmailData,
  SubscriptionConfirmationData,
  LowCreditsData,
  RenewalReminderData,
  PasswordResetData,
} from "./templates";
