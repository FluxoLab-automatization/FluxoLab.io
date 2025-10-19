"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNodeHandler = resolveNodeHandler;
const set_node_1 = require("./set.node");
const if_node_1 = require("./if.node");
const webhook_respond_node_1 = require("./webhook-respond.node");
const smtp_send_node_1 = require("./smtp-send.node");
const webhook_in_node_1 = require("./webhook-in.node");
const handlers = [
    webhook_in_node_1.WebhookInNodeHandler,
    set_node_1.SetNodeHandler,
    if_node_1.IfNodeHandler,
    webhook_respond_node_1.WebhookRespondNodeHandler,
    smtp_send_node_1.SmtpSendNodeHandler,
];
const handlerMap = new Map(handlers.map((handler) => [handler.type, handler]));
function resolveNodeHandler(type) {
    return handlerMap.get(type) ?? null;
}
//# sourceMappingURL=node-registry.js.map