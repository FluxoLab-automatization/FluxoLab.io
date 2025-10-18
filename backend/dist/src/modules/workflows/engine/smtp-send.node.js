"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpSendNodeHandler = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const utils_1 = require("./utils");
exports.SmtpSendNodeHandler = {
    type: 'smtp.send',
    async execute(node, input, ctx) {
        const params = (node.params ?? {});
        if (!params.credentialId) {
            throw new Error('SMTP node requires credentialId');
        }
        const credential = (await ctx.getCredential(params.credentialId)) ?? {};
        const transporter = nodemailer_1.default.createTransport({
            host: credential.host,
            port: credential.port ?? 587,
            secure: credential.secure ?? false,
            auth: credential.user && credential.password
                ? { user: credential.user, pass: credential.password }
                : undefined,
        });
        for (const item of input) {
            const scope = { json: item.json, $json: item.json };
            const mailOptions = {
                from: (0, utils_1.evaluateTemplate)(params.from ?? credential.user ?? '', scope),
                to: (0, utils_1.evaluateTemplate)(params.to, scope),
                subject: (0, utils_1.evaluateTemplate)(params.subject, scope),
                text: params.text ? String((0, utils_1.evaluateTemplate)(params.text, scope)) : undefined,
                html: params.html ? String((0, utils_1.evaluateTemplate)(params.html, scope)) : undefined,
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
//# sourceMappingURL=smtp-send.node.js.map