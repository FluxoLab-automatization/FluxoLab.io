const TEMPLATE_PATTERN = /\{\{\s*([^}]+)\s*\}\}/g;

export function evaluateTemplate(template: unknown, scope: Record<string, unknown>): unknown {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(TEMPLATE_PATTERN, (_match, expression) => {
    const trimmed = expression.trim();
    if (trimmed.startsWith('$json.')) {
      const path = trimmed.replace(/^\$json\./, '');
      const jsonScope = (scope.json ?? scope.$json ?? {}) as Record<string, unknown>;
      const value = lookup(path, jsonScope);
      return value === undefined || value === null ? '' : String(value);
    }
    if (trimmed === '$json') {
      return JSON.stringify(scope.json ?? scope.$json ?? {});
    }
    return scope[trimmed] !== undefined ? String(scope[trimmed]) : '';
  });
}

export function lookup(path: string, obj: Record<string, unknown>): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
