import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { EmailManagementClient } from '../../services/email';
import {
  EmailType,
  GetEmailTemaplateRequest,
  SetEmailTemplateRequest,
  SetSMTPCredentialsRequest,
} from '../../protobufs/email-service-protobufs/email-management_pb';
import { logger } from '../../middlewares';
import { EmailTemplate, EmailTemplateEnum, SMTPData } from '../../types/email';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { validateData } from '../../middlewares/validate-data';
import {
  setEmailTemplateSchema,
  setSMTPCredentialsSchema,
} from '../../validation-schemas/email';

// Create a new router
export const router = express.Router();

// get the SMTP configuration
router.get(
  '/smtp',
  async (req: Request, res: Response, next: NextFunction) => {
    EmailManagementClient.getInstance().getSMTPCredentials(
      new Empty(),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'SMTP configuration fetched successfully.';
        }

        next();
      },
    );
  },
  logger,
);

// set the SMTP configuration
router.post(
  '/smtp',
  validateData(setSMTPCredentialsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO:  check if the password is not empty
    const smtpData: SMTPData = req.body;

    const gRPCRequest = new SetSMTPCredentialsRequest();
    gRPCRequest.setHost(smtpData.host);
    gRPCRequest.setPort(smtpData.port);
    gRPCRequest.setUsername(smtpData.username);
    gRPCRequest.setPassword(smtpData.password);
    gRPCRequest.setSender(smtpData.sender);

    EmailManagementClient.getInstance().setSMTPCredentials(
      gRPCRequest,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'SMTP configuration set successfully.';
        }

        next();
      },
    );
  },
  logger,
);

router.get(
  '/templates/:templateName',
  (req: Request, res: Response, next: NextFunction) => {
    const templateNameParam = req.params.templateName;
    let emailType: EmailType | null = null;

    switch (templateNameParam) {
      case EmailTemplateEnum.EMAIL_VERIFICATION:
        emailType = EmailType.EMAIL_VERIFICATION;
        break;
      case EmailTemplateEnum.MFA_VERIFICATION:
        emailType = EmailType.MFA;
        break;
      case EmailTemplateEnum.PASSWORD_RESET:
        emailType = EmailType.PASSWORD_RESET;
        break;
      default:
        res.status(400).json({ error: 'Invalid template name' });
        return;
    }

    EmailManagementClient.getInstance().getEmailTemplate(
      new GetEmailTemaplateRequest().setEmailType(emailType),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Email template fetched successfully.';
        }

        next();
      },
    );
  },
  logger,
);

router.put(
  '/templates/:templateName',
  validateData(setEmailTemplateSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const templateNameParam = req.params.templateName;
    const emailTemplate: EmailTemplate = req.body;
    let emailType: EmailType | null = null;

    switch (templateNameParam) {
      case EmailTemplateEnum.EMAIL_VERIFICATION:
        emailType = EmailType.EMAIL_VERIFICATION;
        break;
      case EmailTemplateEnum.MFA_VERIFICATION:
        emailType = EmailType.MFA;
        break;
      case EmailTemplateEnum.PASSWORD_RESET:
        emailType = EmailType.PASSWORD_RESET;
        break;
      default:
        res.status(400).json({ error: 'Invalid template name' });
        return;
    }

    const gRPCRequest = new SetEmailTemplateRequest();
    gRPCRequest.setEmailType(emailType);
    gRPCRequest.setSubject(emailTemplate.subject);
    gRPCRequest.setBody(emailTemplate.body);
    gRPCRequest.setRedirectUrl(emailTemplate.redirectUrl);

    EmailManagementClient.getInstance().setEmailTemplate(
      gRPCRequest,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Email template set successfully.';
        }

        next();
      },
    );
  },
  logger,
);
