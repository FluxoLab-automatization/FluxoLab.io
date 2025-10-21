"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode = __importStar(require("qrcode-terminal"));
const whatsapp_gateway_1 = require("./whatsapp.gateway");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    configService;
    gateway;
    logger = new common_1.Logger(WhatsappService_1.name);
    client;
    isReady = false;
    constructor(configService, gateway) {
        this.configService = configService;
        this.gateway = gateway;
    }
    onModuleInit() {
        this.logger.log('Initializing WhatsApp client...');
        this.gateway.broadcast('whatsapp.status', { status: 'INITIALIZING' });
        const sessionPath = this.configService.get('WHATSAPP_SESSION_PATH');
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth({ dataPath: sessionPath }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });
        this.client.on('qr', (qr) => {
            this.logger.log('WhatsApp QR Code received. Broadcasting via WebSocket.');
            qrcode.generate(qr, { small: true });
            this.gateway.broadcast('whatsapp.qr', { qr });
            this.gateway.broadcast('whatsapp.status', { status: 'QR_RECEIVED' });
        });
        this.client.on('ready', () => {
            this.isReady = true;
            this.logger.log('WhatsApp client is ready!');
            this.gateway.broadcast('whatsapp.status', { status: 'READY' });
        });
        this.client.on('auth_failure', (msg) => {
            this.isReady = false;
            this.logger.error(`WhatsApp authentication failure: ${msg}`);
            this.gateway.broadcast('whatsapp.status', { status: 'AUTH_FAILURE' });
        });
        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            this.logger.warn(`WhatsApp client disconnected: ${reason}`);
            this.gateway.broadcast('whatsapp.status', { status: 'DISCONNECTED' });
            this.client.initialize();
        });
        this.client.initialize().catch(error => {
            this.logger.error('Failed to initialize WhatsApp client', error);
            this.gateway.broadcast('whatsapp.status', { status: 'INIT_FAILURE' });
        });
    }
    async sendMessage(to, message) {
        if (!this.isReady) {
            this.logger.warn('WhatsApp client is not ready. Message not sent.');
            throw new Error('Client not ready');
        }
        const chatId = `${to}@c.us`;
        try {
            this.logger.log(`Sending message to ${to}`);
            await this.client.sendMessage(chatId, message);
            this.logger.log(`Message sent successfully to ${to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${to}`, error);
            throw error;
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        whatsapp_gateway_1.WhatsappGateway])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map