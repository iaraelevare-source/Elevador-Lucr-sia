// Adapter to toggle between core email module and features_elevare email

import * as core from "../email";

const useFeatures = process.env.USE_FEATURES_EMAIL === "true";

export type EmailOptions = core.EmailOptions;
export type EmailResult = core.EmailResult;
export type WelcomeEmailData = core.WelcomeEmailData;
export type SubscriptionConfirmationData = core.SubscriptionConfirmationData;
export type LowCreditsData = core.LowCreditsData;
export type RenewalReminderData = core.RenewalReminderData;
export type PasswordResetData = core.PasswordResetData;

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (useFeatures) {
    const feat = await import("../../features_elevare/email");
    if (typeof (feat as any).sendEmail === "function") {
      return (feat as any).sendEmail(options);
    }
  }
  return core.sendEmail(options);
}

export async function getEmailConfig() {
  if (useFeatures) {
    const feat = await import("../../features_elevare/email");
    if (typeof (feat as any).getEmailConfig === "function") {
      return (feat as any).getEmailConfig();
    }
  }
  return core.getEmailConfig();
}

// Re-export all email templates from core (features não tem templates ainda)
export const welcomeEmail = core.welcomeEmail;
export const subscriptionConfirmationEmail = core.subscriptionConfirmationEmail;
export const lowCreditsEmail = core.lowCreditsEmail;
export const renewalReminderEmail = core.renewalReminderEmail;
export const passwordResetEmail = core.passwordResetEmail;
