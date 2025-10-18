"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookInNodeHandler = void 0;
exports.WebhookInNodeHandler = {
    type: 'webhook.in',
    async execute(_node, input) {
        return {
            itemsByOutput: {
                default: input,
            },
        };
    },
};
//# sourceMappingURL=webhook-in.node.js.map