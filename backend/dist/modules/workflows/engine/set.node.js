"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetNodeHandler = void 0;
const utils_1 = require("./utils");
exports.SetNodeHandler = {
    type: 'set',
    async execute(node, input, ctx) {
        const params = (node.params ?? {});
        const assign = params.assign ?? {};
        const keepOriginal = params.keepOriginal ?? true;
        const items = input.map((item) => {
            const base = keepOriginal ? { ...item.json } : {};
            const scope = { json: item.json, $json: item.json };
            for (const [key, value] of Object.entries(assign)) {
                base[key] = (0, utils_1.evaluateTemplate)(value, scope);
            }
            return {
                ...item,
                json: base,
            };
        });
        return {
            itemsByOutput: {
                default: items,
            },
        };
    },
};
//# sourceMappingURL=set.node.js.map