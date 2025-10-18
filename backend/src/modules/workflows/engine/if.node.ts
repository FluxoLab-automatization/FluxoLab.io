import { NodeHandler } from './types';
import { evaluateTemplate, lookup } from './utils';

type Operator = 'equals' | 'notEmpty' | 'contains';

interface IfParams {
  left?: string;
  operator?: Operator;
  right?: unknown;
}

export const IfNodeHandler: NodeHandler = {
  type: 'if.branch',
  async execute(node, input) {
    const params = (node.params ?? {}) as IfParams;
    const leftPath = params.left ?? '$json';
    const operator = params.operator ?? 'notEmpty';
    const right = params.right ?? '';

    const truthy: typeof input = [];
    const falsy: typeof input = [];

    for (const item of input) {
      const scope = { json: item.json, $json: item.json };
      let leftValue: unknown;
      if (leftPath.startsWith('$json.')) {
        leftValue = lookup(leftPath.replace(/^\$json\./, ''), item.json);
      } else if (leftPath === '$json') {
        leftValue = item.json;
      } else {
        leftValue = evaluateTemplate(leftPath, scope);
      }

      const rightValue =
        typeof right === 'string' ? evaluateTemplate(right, scope) : right;

      const passes = evaluateCondition(leftValue, operator, rightValue);
      if (passes) {
        truthy.push(item);
      } else {
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

function evaluateCondition(left: unknown, operator: Operator, right: unknown): boolean {
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
        return Object.keys(left as Record<string, unknown>).length > 0;
      }
      return String(left).trim().length > 0;
  }
}

