export declare class GenerateWebhookDto {
    workspaceId: string;
    workflowId: string;
    userId?: string;
    path?: string;
    method?: 'GET' | 'POST';
    respondMode?: 'immediate' | 'on_last_node' | 'via_node';
    description?: string;
}
