import { NodeHandler, WorkflowItem } from './types';
import { evaluateTemplate } from './utils';

interface SetParams {
  assign?: Record<string, unknown>;
  keepOriginal?: boolean;
}

export const SetNodeHandler: NodeHandler = {
  type: 'set',
  async execute(node, input, ctx) {
    const params = (node.params ?? {}) as SetParams;
    const assign = params.assign ?? {};
    const keepOriginal = params.keepOriginal ?? true;

    const items: WorkflowItem[] = input.map((item) => {
      const base = keepOriginal ? { ...item.json } : {};
      const scope = { json: item.json, $json: item.json };
      for (const [key, value] of Object.entries(assign)) {
        base[key] = evaluateTemplate(value, scope);
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

