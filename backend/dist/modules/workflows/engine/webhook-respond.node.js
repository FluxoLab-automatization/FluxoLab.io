"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRespondNodeHandler = void 0;
const utils_1 = require("./utils");
exports.WebhookRespondNodeHandler = {
    type: 'webhook.respond',
    async execute(node, input, ctx) {
        if (!ctx.respond) {
            return {
                itemsByOutput: {
                    default: input,
                },
            };
        }
        const params = (node.params ?? {});
        const first = input[0] ?? { json: {} };
        const scope = { json: first.json, $json: first.json };
        const status = params.status ?? 200;
        if (params.text) {
            await ctx.respond(status, (0, utils_1.evaluateTemplate)(params.text, scope));
        }
        else {
            const payload = params.json !== undefined
                ? Object.fromEntries(Object.entries(params.json).map(([key, value]) => [
                    key,
                    (0, utils_1.evaluateTemplate)(value, scope),
                ]))
                : first.json;
            await ctx.respond(status, payload);
        }
        return {
            itemsByOutput: {
                default: input,
            },
        };
    },
};
//# sourceMappingURL=webhook-respond.node.js.map