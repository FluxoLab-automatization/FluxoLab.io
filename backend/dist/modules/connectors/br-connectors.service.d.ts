import { Repository } from 'typeorm';
import { Connection, ConnectionSecret, OAuthToken } from './entities';
export declare class BrConnectorsService {
    private connectionRepository;
    private connectionSecretRepository;
    private oauthTokenRepository;
    private readonly logger;
    constructor(connectionRepository: Repository<Connection>, connectionSecretRepository: Repository<ConnectionSecret>, oauthTokenRepository: Repository<OAuthToken>);
    createPixPayment(connectionId: string, paymentData: {
        amount: number;
        description: string;
        payer: {
            name: string;
            document: string;
            email?: string;
            phone?: string;
        };
    }): Promise<{
        paymentId: string;
        status: string;
        qrCode: string;
        qrCodeImage: string;
        expiresAt: Date;
    }>;
    getPixPaymentStatus(connectionId: string, paymentId: string): Promise<{
        paymentId: string;
        status: string;
        amount: number;
        paidAt: Date;
        transactionId: string;
    }>;
    sendWhatsAppMessage(connectionId: string, messageData: {
        to: string;
        message: string;
        type: 'text' | 'template' | 'interactive';
        templateName?: string;
        templateParams?: any[];
    }): Promise<{
        messageId: string;
        status: string;
        to: string;
        sentAt: Date;
    }>;
    getWhatsAppMessageStatus(connectionId: string, messageId: string): Promise<{
        messageId: string;
        status: string;
        deliveredAt: Date;
    }>;
    createGlpiTicket(connectionId: string, ticketData: {
        title: string;
        description: string;
        priority: number;
        category: string;
        requester: string;
    }): Promise<{
        ticketId: string;
        status: string;
        title: string;
        createdAt: Date;
    }>;
    updateGlpiTicket(connectionId: string, ticketId: string, updateData: any): Promise<{
        ticketId: string;
        status: string;
        updatedAt: Date;
    }>;
    generateNfe(connectionId: string, nfeData: {
        emitter: {
            cnpj: string;
            name: string;
            address: any;
        };
        receiver: {
            cnpj?: string;
            cpf?: string;
            name: string;
            address: any;
        };
        items: Array<{
            description: string;
            quantity: number;
            unitValue: number;
            totalValue: number;
            ncm: string;
            cfop: string;
        }>;
    }): Promise<{
        nfeId: string;
        status: string;
        xml: string;
        pdf: string;
        generatedAt: Date;
    }>;
    getMetaLead(connectionId: string, leadId: string): Promise<{
        leadId: string;
        name: string;
        email: string;
        phone: string;
        source: string;
        createdAt: Date;
        formData: {
            interest: string;
            budget: string;
        };
    }>;
    getMetaLeads(connectionId: string, filters?: {
        dateFrom?: Date;
        dateTo?: Date;
        source?: string;
        limit?: number;
    }): Promise<{
        leads: {
            leadId: string;
            name: string;
            email: string;
            phone: string;
            source: string;
            createdAt: Date;
        }[];
        total: number;
        hasMore: boolean;
    }>;
    getProtheusData(connectionId: string, table: string, filters?: any): Promise<{
        data: never[];
        total: number;
        table: string;
    }>;
    createProtheusRecord(connectionId: string, table: string, data: any): Promise<{
        recordId: string;
        status: string;
        table: string;
        createdAt: Date;
    }>;
    getSankhyaData(connectionId: string, service: string, params?: any): Promise<{
        data: never[];
        service: string;
        timestamp: Date;
    }>;
    getOmieData(connectionId: string, endpoint: string, params?: any): Promise<{
        data: never[];
        endpoint: string;
        timestamp: Date;
    }>;
    getAnsData(connectionId: string, endpoint: string, params?: any): Promise<{
        data: never[];
        endpoint: string;
        timestamp: Date;
    }>;
    processTissData(connectionId: string, tissData: any): Promise<{
        processed: boolean;
        records: number;
        errors: never[];
        processedAt: Date;
    }>;
    getMercadoLivreOrders(connectionId: string, filters?: any): Promise<{
        orders: never[];
        total: number;
        hasMore: boolean;
    }>;
    updateMercadoLivreOrder(connectionId: string, orderId: string, updateData: any): Promise<{
        orderId: string;
        status: string;
        updatedAt: Date;
    }>;
    sendEsocialEvent(connectionId: string, eventData: any): Promise<{
        eventId: string;
        status: string;
        sentAt: Date;
    }>;
    getFgtsData(connectionId: string, cpf: string): Promise<{
        cpf: string;
        balance: number;
        lastUpdate: Date;
    }>;
}
