import { NodeHandler } from './types';
import { evaluateTemplate } from './utils';

interface RespondParams {
  status?: number;
  json?: Record<string, unknown>;
  text?: string;
}

export const WebhookRespondNodeHandler: NodeHandler = {
  type: 'webhook.respond',
  async execute(node, input, ctx) {
    if (!ctx.respond) {
      return {
        itemsByOutput: {
          default: input,
        },
      };
    }

    const params = (node.params ?? {}) as RespondParams;
    const first = input[0] ?? { json: {} };
    const scope = { json: first.json, $json: first.json };
    const status = params.status ?? 200;

    if (params.text) {
      await ctx.respond(status, evaluateTemplate(params.text, scope));
    } else {
      const payload =
        params.json !== undefined
          ? Object.fromEntries(
              Object.entries(params.json).map(([key, value]) => [
                key,
                evaluateTemplate(value, scope),
              ]),
            )
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

