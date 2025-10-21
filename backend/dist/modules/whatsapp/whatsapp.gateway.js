"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsappGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let WhatsappGateway = WhatsappGateway_1 = class WhatsappGateway {
    logger = new common_1.Logger(WhatsappGateway_1.name);
    server;
    afterInit(server) {
        this.logger.log('WhatsApp WebSocket Gateway Initialized');
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    broadcast(event, data) {
        this.server.emit(event, data);
    }
};
exports.WhatsappGateway = WhatsappGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WhatsappGateway.prototype, "server", void 0);
exports.WhatsappGateway = WhatsappGateway = WhatsappGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], WhatsappGateway);
//# sourceMappingURL=whatsapp.gateway.js.map