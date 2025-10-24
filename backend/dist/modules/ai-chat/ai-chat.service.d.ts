import { DatabaseService } from '../../shared/database/database.service';
import { CreateConversationDto, SendMessageDto, CreateWorkflowSuggestionDto, UpdateConversationDto, GetConversationsDto } from './dto/ai-chat.dto';
export declare class AiChatService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    createConversation(workspaceId: string, userId: string, createConversationDto: CreateConversationDto): Promise<any>;
    getConversations(workspaceId: string, userId: string, query: GetConversationsDto): Promise<any[]>;
    getConversationById(workspaceId: string, userId: string, conversationId: string): Promise<any>;
    updateConversation(workspaceId: string, userId: string, conversationId: string, updateConversationDto: UpdateConversationDto): Promise<any>;
    deleteConversation(workspaceId: string, userId: string, conversationId: string): Promise<{
        message: string;
    }>;
    sendMessage(workspaceId: string, userId: string, conversationId: string, sendMessageDto: SendMessageDto): Promise<{
        user_message: any;
        ai_message: any;
    }>;
    getMessages(workspaceId: string, userId: string, conversationId: string): Promise<any[]>;
    createWorkflowSuggestion(workspaceId: string, userId: string, conversationId: string, createSuggestionDto: CreateWorkflowSuggestionDto): Promise<any>;
    getWorkflowSuggestions(workspaceId: string, userId: string, conversationId?: string): Promise<any[]>;
    updateWorkflowSuggestionStatus(workspaceId: string, userId: string, suggestionId: string, status: string): Promise<any>;
    getWorkspaceAISettings(workspaceId: string): Promise<any>;
    updateWorkspaceAISettings(workspaceId: string, settings: any): Promise<any>;
    private generateAIResponse;
}
