import { DatabaseService } from '../../shared/database/database.service';
import { CreateTicketDto, UpdateTicketDto, CreateTicketMessageDto, UpdateTicketMessageDto, CreateTicketRatingDto, GetTicketsDto, CreateCategoryDto, UpdateCategoryDto, CreatePriorityDto, UpdatePriorityDto } from './dto/support.dto';
export declare class SupportService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    createTicket(workspaceId: string, userId: string, createTicketDto: CreateTicketDto): Promise<any>;
    getTickets(workspaceId: string, userId: string, query: GetTicketsDto): Promise<any[]>;
    getTicketById(workspaceId: string, userId: string, ticketId: string): Promise<any>;
    updateTicket(workspaceId: string, userId: string, ticketId: string, updateTicketDto: UpdateTicketDto): Promise<any>;
    deleteTicket(workspaceId: string, userId: string, ticketId: string): Promise<{
        message: string;
    }>;
    createTicketMessage(workspaceId: string, userId: string, ticketId: string, createMessageDto: CreateTicketMessageDto): Promise<any>;
    getTicketMessages(workspaceId: string, userId: string, ticketId: string): Promise<any[]>;
    updateTicketMessage(workspaceId: string, userId: string, messageId: string, updateMessageDto: UpdateTicketMessageDto): Promise<any>;
    deleteTicketMessage(workspaceId: string, userId: string, messageId: string): Promise<{
        message: string;
    }>;
    createTicketRating(workspaceId: string, userId: string, ticketId: string, createRatingDto: CreateTicketRatingDto): Promise<any>;
    getTicketRatings(workspaceId: string, ticketId: string): Promise<any[]>;
    createCategory(createCategoryDto: CreateCategoryDto): Promise<any>;
    getCategories(): Promise<any[]>;
    updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
    createPriority(createPriorityDto: CreatePriorityDto): Promise<any>;
    getPriorities(): Promise<any[]>;
    updatePriority(id: string, updatePriorityDto: UpdatePriorityDto): Promise<any>;
    deletePriority(id: string): Promise<{
        message: string;
    }>;
    getStatuses(): Promise<any[]>;
    private generateTicketNumber;
    private getUserRole;
    private recordTicketHistory;
}
