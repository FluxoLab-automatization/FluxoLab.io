"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateTemplate = evaluateTemplate;
exports.lookup = lookup;
const TEMPLATE_PATTERN = /\{\{\s*([^}]+)\s*\}\}/g;
function evaluateTemplate(template, scope) {
    if (typeof template !== 'string') {
        return template;
    }
    return template.replace(TEMPLATE_PATTERN, (_match, expression) => {
        const trimmed = expression.trim();
        if (trimmed.startsWith('$json.')) {
            const path = trimmed.replace(/^\$json\./, '');
            const value = lookup(path, scope.json ?? scope.$json ?? {});
            return value === undefined || value === null ? '' : String(value);
        }
        if (trimmed === '$json') {
            return JSON.stringify(scope.json ?? scope.$json ?? {});
        }
        return scope[trimmed] !== undefined ? String(scope[trimmed]) : '';
    });
}
function lookup(path, obj) {
    return path.split('.').reduce((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return acc[key];
        }
        return undefined;
    }, obj);
}
//# sourceMappingURL=utils.js.map