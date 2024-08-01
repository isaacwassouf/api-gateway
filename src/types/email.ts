export interface SMTPData {
  host: string;
  port: number;
  username: string;
  password: string;
  sender: string;
}

export enum EmailTemplateEnum {
  EMAIL_VERIFICATION = 'email-verification',
  MFA_VERIFICATION = 'mfa-verification',
  PASSWORD_RESET = 'password-reset',
}

export interface EmailTemplate {
  subject: string;
  body: string;
  redirectUrl: string;
}
