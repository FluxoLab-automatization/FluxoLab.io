import { SupportService } from './support.service';
import { CreateTicketDto, UpdateTicketDto, CreateTicketMessageDto, UpdateTicketMessageDto, CreateTicketRatingDto, GetTicketsDto, CreateCategoryDto, UpdateCategoryDto, CreatePriorityDto, UpdatePriorityDto } from './dto/support.dto';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    createTicket(createTicketDto: CreateTicketDto, user: any, req: any): Promise<any>;
    getTickets(query: GetTicketsDto, user: any, req: any): Promise<any[]>;
    getTicketById(id: string, user: any, req: any): Promise<any>;
    updateTicket(id: string, updateTicketDto: UpdateTicketDto, user: any, req: any): Promise<any>;
    deleteTicket(id: string, user: any, req: any): Promise<{
        message: string;
    }>;
    createTicketMessage(id: string, createMessageDto: CreateTicketMessageDto, user: any, req: any): Promise<any>;
    getTicketMessages(id: string, user: any, req: any): Promise<any[]>;
    updateTicketMessage(id: string, updateMessageDto: UpdateTicketMessageDto, user: any, req: any): Promise<any>;
    deleteTicketMessage(id: string, user: any, req: any): Promise<{
        message: string;
    }>;
    createTicketRating(id: string, createRatingDto: CreateTicketRatingDto, user: any, req: any): Promise<any>;
    getTicketRatings(id: string, req: any): Promise<any[]>;
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
}
