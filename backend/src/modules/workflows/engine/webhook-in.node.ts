import { NodeHandler } from './types';

export const WebhookInNodeHandler: NodeHandler = {
  type: 'webhook.in',
  async execute(_node, input) {
    return {
      itemsByOutput: {
        default: input,
      },
    };
  },
};

