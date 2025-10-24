import { AiChatService } from './ai-chat.service';
import { CreateConversationDto, SendMessageDto, CreateWorkflowSuggestionDto, UpdateConversationDto, GetConversationsDto } from './dto/ai-chat.dto';
export declare class AiChatController {
    private readonly aiChatService;
    constructor(aiChatService: AiChatService);
    createConversation(createConversationDto: CreateConversationDto, user: any, req: any): Promise<any>;
    getConversations(query: GetConversationsDto, user: any, req: any): Promise<any[]>;
    getConversationById(id: string, user: any, req: any): Promise<any>;
    updateConversation(id: string, updateConversationDto: UpdateConversationDto, user: any, req: any): Promise<any>;
    deleteConversation(id: string, user: any, req: any): Promise<{
        message: string;
    }>;
    sendMessage(id: string, sendMessageDto: SendMessageDto, user: any, req: any): Promise<{
        user_message: any;
        ai_message: any;
    }>;
    getMessages(id: string, user: any, req: any): Promise<any[]>;
    createWorkflowSuggestion(id: string, createSuggestionDto: CreateWorkflowSuggestionDto, user: any, req: any): Promise<any>;
    getWorkflowSuggestions(conversationId: string, user: any, req: any): Promise<any[]>;
    updateWorkflowSuggestionStatus(id: string, status: string, user: any, req: any): Promise<any>;
    getWorkspaceAISettings(req: any): Promise<any>;
    updateWorkspaceAISettings(settings: any, req: any): Promise<any>;
}
