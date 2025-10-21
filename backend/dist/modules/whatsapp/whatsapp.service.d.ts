import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappGateway } from './whatsapp.gateway';
export declare class WhatsappService implements OnModuleInit {
    private readonly configService;
    private readonly gateway;
    private readonly logger;
    private client;
    private isReady;
    constructor(configService: ConfigService, gateway: WhatsappGateway);
    onModuleInit(): void;
    sendMessage(to: string, message: string): Promise<void>;
}
