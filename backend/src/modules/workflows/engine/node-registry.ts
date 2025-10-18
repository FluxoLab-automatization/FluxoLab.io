import { NodeHandler } from './types';
import { SetNodeHandler } from './set.node';
import { IfNodeHandler } from './if.node';
import { WebhookRespondNodeHandler } from './webhook-respond.node';
import { SmtpSendNodeHandler } from './smtp-send.node';
import { WebhookInNodeHandler } from './webhook-in.node';

const handlers: NodeHandler[] = [
  WebhookInNodeHandler,
  SetNodeHandler,
  IfNodeHandler,
  WebhookRespondNodeHandler,
  SmtpSendNodeHandler,
];

const handlerMap = new Map(handlers.map((handler) => [handler.type, handler]));

export function resolveNodeHandler(type: string): NodeHandler | null {
  return handlerMap.get(type) ?? null;
}
