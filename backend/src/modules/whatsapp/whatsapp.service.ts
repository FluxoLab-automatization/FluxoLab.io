import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { WhatsappGateway } from './whatsapp.gateway';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client;
  private isReady = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly gateway: WhatsappGateway,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing WhatsApp client...');
    this.gateway.broadcast('whatsapp.status', { status: 'INITIALIZING' });

    const sessionPath = this.configService.get<string>('WHATSAPP_SESSION_PATH');

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: sessionPath }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.client.on('qr', (qr) => {
      this.logger.log('WhatsApp QR Code received. Broadcasting via WebSocket.');
      qrcode.generate(qr, { small: true }); // Continua mostrando no console por conveniência
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

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('WhatsApp client is not ready. Message not sent.');
      throw new Error('Client not ready');
    }

    const chatId = `${to}@c.us`;

    try {
      this.logger.log(`Sending message to ${to}`);
      await this.client.sendMessage(chatId, message);
      this.logger.log(`Message sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send message to ${to}`, error);
      throw error;
    }
  }
}
