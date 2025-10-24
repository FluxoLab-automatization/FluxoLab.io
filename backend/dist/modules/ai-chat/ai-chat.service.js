"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let AiChatService = class AiChatService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createConversation(workspaceId, userId, createConversationDto) {
        const { title, context_type, context_data } = createConversationDto;
        const result = await this.databaseService.query(`INSERT INTO ai_conversations (workspace_id, user_id, title, context_type, context_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [workspaceId, userId, title, context_type, context_data]);
        return result[0];
    }
    async getConversations(workspaceId, userId, query) {
        const { context_type, status, limit, offset } = query;
        let whereClause = 'WHERE workspace_id = $1 AND user_id = $2';
        const params = [workspaceId, userId];
        let paramIndex = 3;
        if (context_type) {
            whereClause += ` AND context_type = $${paramIndex}`;
            params.push(context_type);
            paramIndex++;
        }
        if (status) {
            whereClause += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        const result = await this.databaseService.query(`SELECT * FROM ai_conversations 
       ${whereClause}
       ORDER BY updated_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, offset]);
        return result;
    }
    async getConversationById(workspaceId, userId, conversationId) {
        const result = await this.databaseService.query(`SELECT * FROM ai_conversations 
       WHERE id = $1 AND workspace_id = $2 AND user_id = $3`, [conversationId, workspaceId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return result[0];
    }
    async updateConversation(workspaceId, userId, conversationId, updateConversationDto) {
        const { title, status } = updateConversationDto;
        const result = await this.databaseService.query(`UPDATE ai_conversations 
       SET title = COALESCE($1, title),
           status = COALESCE($2, status),
           updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4 AND user_id = $5
       RETURNING *`, [title, status, conversationId, workspaceId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return result[0];
    }
    async deleteConversation(workspaceId, userId, conversationId) {
        const result = await this.databaseService.query(`UPDATE ai_conversations 
       SET status = 'deleted', updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND user_id = $3
       RETURNING *`, [conversationId, workspaceId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return { message: 'Conversa deletada com sucesso' };
    }
    async sendMessage(workspaceId, userId, conversationId, sendMessageDto) {
        const { content, metadata } = sendMessageDto;
        const conversation = await this.getConversationById(workspaceId, userId, conversationId);
        const userMessage = await this.databaseService.query(`INSERT INTO ai_messages (conversation_id, role, content, metadata)
       VALUES ($1, 'user', $2, $3)
       RETURNING *`, [conversationId, content, metadata || {}]);
        const aiResponse = await this.generateAIResponse(conversation, content);
        const aiMessage = await this.databaseService.query(`INSERT INTO ai_messages (conversation_id, role, content, metadata, tokens_used)
       VALUES ($1, 'assistant', $2, $3, $4)
       RETURNING *`, [conversationId, aiResponse.content, aiResponse.metadata, aiResponse.tokens_used]);
        await this.databaseService.query('UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
        return {
            user_message: userMessage[0],
            ai_message: aiMessage[0]
        };
    }
    async getMessages(workspaceId, userId, conversationId) {
        await this.getConversationById(workspaceId, userId, conversationId);
        const result = await this.databaseService.query(`SELECT * FROM ai_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`, [conversationId]);
        return result;
    }
    async createWorkflowSuggestion(workspaceId, userId, conversationId, createSuggestionDto) {
        const { title, description, workflow_definition, suggestion_type, confidence_score } = createSuggestionDto;
        await this.getConversationById(workspaceId, userId, conversationId);
        const result = await this.databaseService.query(`INSERT INTO ai_workflow_suggestions (conversation_id, user_id, suggestion_type, title, description, workflow_definition, confidence_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [conversationId, userId, suggestion_type, title, description, workflow_definition, confidence_score]);
        return result[0];
    }
    async getWorkflowSuggestions(workspaceId, userId, conversationId) {
        let whereClause = 'WHERE s.user_id = $1';
        const params = [userId];
        let paramIndex = 2;
        if (conversationId) {
            whereClause += ` AND s.conversation_id = $${paramIndex}`;
            params.push(conversationId);
        }
        const result = await this.databaseService.query(`SELECT s.*, c.title as conversation_title
       FROM ai_workflow_suggestions s
       LEFT JOIN ai_conversations c ON s.conversation_id = c.id
       ${whereClause}
       ORDER BY s.created_at DESC`, params);
        return result;
    }
    async updateWorkflowSuggestionStatus(workspaceId, userId, suggestionId, status) {
        const result = await this.databaseService.query(`UPDATE ai_workflow_suggestions 
       SET status = $1, applied_at = CASE WHEN $1 = 'accepted' THEN NOW() ELSE applied_at END
       WHERE id = $2 AND user_id = $3
       RETURNING *`, [status, suggestionId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Sugestão não encontrada');
        }
        return result[0];
    }
    async getWorkspaceAISettings(workspaceId) {
        const result = await this.databaseService.query('SELECT * FROM workspace_ai_settings WHERE workspace_id = $1', [workspaceId]);
        if (result.length === 0) {
            return {
                workspace_id: workspaceId,
                model_name: 'gpt-3.5-turbo',
                max_tokens: 2000,
                temperature: 0.7,
                enable_workflow_suggestions: true,
                enable_code_generation: true,
                custom_instructions: null
            };
        }
        return result[0];
    }
    async updateWorkspaceAISettings(workspaceId, settings) {
        const { model_name, max_tokens, temperature, enable_workflow_suggestions, enable_code_generation, custom_instructions } = settings;
        const result = await this.databaseService.query(`INSERT INTO workspace_ai_settings (workspace_id, model_name, max_tokens, temperature, enable_workflow_suggestions, enable_code_generation, custom_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (workspace_id) 
       DO UPDATE SET 
         model_name = EXCLUDED.model_name,
         max_tokens = EXCLUDED.max_tokens,
         temperature = EXCLUDED.temperature,
         enable_workflow_suggestions = EXCLUDED.enable_workflow_suggestions,
         enable_code_generation = EXCLUDED.enable_code_generation,
         custom_instructions = EXCLUDED.custom_instructions,
         updated_at = NOW()
       RETURNING *`, [workspaceId, model_name, max_tokens, temperature, enable_workflow_suggestions, enable_code_generation, custom_instructions]);
        return result[0];
    }
    async generateAIResponse(conversation, userMessage) {
        const responses = [
            "Entendo sua necessidade. Vou ajudá-lo a criar um workflow eficiente para isso.",
            "Baseado no que você descreveu, sugiro usar os seguintes nós:",
            "Aqui está uma sugestão de workflow que pode resolver seu problema:",
            "Vou analisar sua solicitação e criar uma solução personalizada."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return {
            content: randomResponse,
            metadata: {
                model: 'gpt-3.5-turbo',
                context_type: conversation.context_type
            },
            tokens_used: Math.floor(Math.random() * 100) + 50
        };
    }
};
exports.AiChatService = AiChatService;
exports.AiChatService = AiChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AiChatService);
//# sourceMappingURL=ai-chat.service.js.map