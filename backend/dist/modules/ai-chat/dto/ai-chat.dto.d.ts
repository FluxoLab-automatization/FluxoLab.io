export declare class CreateConversationDto {
    title: string;
    context_type?: string;
    context_data?: Record<string, any>;
}
export declare class SendMessageDto {
    content: string;
    metadata?: Record<string, any>;
}
export declare class CreateWorkflowSuggestionDto {
    title: string;
    description?: string;
    workflow_definition?: Record<string, any>;
    suggestion_type?: string;
    confidence_score?: number;
}
export declare class UpdateConversationDto {
    title?: string;
    status?: string;
}
export declare class GetConversationsDto {
    context_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
}
