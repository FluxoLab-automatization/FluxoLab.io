import nodemailer from 'nodemailer';
import { NodeHandler } from './types';
import { evaluateTemplate } from './utils';

interface SmtpParams {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  credentialId: string;
}

interface SmtpCredential {
  host: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
}

export const SmtpSendNodeHandler: NodeHandler = {
  type: 'smtp.send',
  async execute(node, input, ctx) {
    const rawParams = (node.params ?? {}) as Partial<SmtpParams>;
    if (!rawParams.credentialId) {
      throw new Error('SMTP node requires credentialId');
    }
    if (!rawParams.to) {
      throw new Error('SMTP node requires recipient (to)');
    }
    if (!rawParams.subject) {
      throw new Error('SMTP node requires subject');
    }
    const params: SmtpParams = {
      credentialId: rawParams.credentialId,
      to: String(rawParams.to),
      subject: String(rawParams.subject),
      from: rawParams.from,
      text: rawParams.text,
      html: rawParams.html,
    };

    const credential = (await ctx.getCredential<SmtpCredential>(params.credentialId)) ?? {};
    const transporter = nodemailer.createTransport({
      host: credential.host,
      port: credential.port ?? 587,
      secure: credential.secure ?? false,
      auth:
        credential.user && credential.password
          ? { user: credential.user, pass: credential.password }
          : undefined,
    });

    for (const item of input) {
      const scope = { json: item.json, $json: item.json };
      const mailOptions = {
        from: evaluateTemplate(params.from ?? credential.user ?? '', scope),
        to: evaluateTemplate(params.to, scope),
        subject: evaluateTemplate(params.subject, scope),
        text: params.text ? String(evaluateTemplate(params.text, scope)) : undefined,
        html: params.html ? String(evaluateTemplate(params.html, scope)) : undefined,
      };
      await transporter.sendMail(mailOptions);
      ctx.log('smtp.send.success', { to: mailOptions.to });
    }

    return {
      itemsByOutput: {
        default: input,
      },
    };
  },
};
