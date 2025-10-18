"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfNodeHandler = void 0;
const utils_1 = require("./utils");
exports.IfNodeHandler = {
    type: 'if.branch',
    async execute(node, input) {
        const params = (node.params ?? {});
        const leftPath = params.left ?? '$json';
        const operator = params.operator ?? 'notEmpty';
        const right = params.right ?? '';
        const truthy = [];
        const falsy = [];
        for (const item of input) {
            const scope = { json: item.json, $json: item.json };
            let leftValue;
            if (leftPath.startsWith('$json.')) {
                leftValue = (0, utils_1.lookup)(leftPath.replace(/^\$json\./, ''), item.json);
            }
            else if (leftPath === '$json') {
                leftValue = item.json;
            }
            else {
                leftValue = (0, utils_1.evaluateTemplate)(leftPath, scope);
            }
            const rightValue = typeof right === 'string' ? (0, utils_1.evaluateTemplate)(right, scope) : right;
            const passes = evaluateCondition(leftValue, operator, rightValue);
            if (passes) {
                truthy.push(item);
            }
            else {
                falsy.push(item);
            }
        }
        return {
            itemsByOutput: {
                true: truthy,
                false: falsy,
            },
        };
    },
};
function evaluateCondition(left, operator, right) {
    switch (operator) {
        case 'equals':
            return String(left ?? '') === String(right ?? '');
        case 'contains':
            return Array.isArray(left)
                ? left.includes(right)
                : String(left ?? '').includes(String(right ?? ''));
        case 'notEmpty':
        default:
            if (left === null || left === undefined) {
                return false;
            }
            if (Array.isArray(left)) {
                return left.length > 0;
            }
            if (typeof left === 'object') {
                return Object.keys(left).length > 0;
            }
            return String(left).trim().length > 0;
    }
}
//# sourceMappingURL=if.node.js.map