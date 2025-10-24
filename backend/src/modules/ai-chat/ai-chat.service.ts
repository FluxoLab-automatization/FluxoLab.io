import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { CreateConversationDto, SendMessageDto, CreateWorkflowSuggestionDto, UpdateConversationDto, GetConversationsDto } from './dto/ai-chat.dto';

@Injectable()
export class AiChatService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Conversas
  async createConversation(workspaceId: string, userId: string, createConversationDto: CreateConversationDto) {
    const { title, context_type, context_data } = createConversationDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO ai_conversations (workspace_id, user_id, title, context_type, context_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [workspaceId, userId, title, context_type, context_data]
    );

    return result[0];
  }

  async getConversations(workspaceId: string, userId: string, query: GetConversationsDto) {
    const { context_type, status, limit, offset } = query;
    
    let whereClause = 'WHERE workspace_id = $1 AND user_id = $2';
    const params: any[] = [workspaceId, userId];
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

    const result = await this.databaseService.query(
      `SELECT * FROM ai_conversations 
       ${whereClause}
       ORDER BY updated_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return result;
  }

  async getConversationById(workspaceId: string, userId: string, conversationId: string) {
    const result = await this.databaseService.query(
      `SELECT * FROM ai_conversations 
       WHERE id = $1 AND workspace_id = $2 AND user_id = $3`,
      [conversationId, workspaceId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return result[0];
  }

  async updateConversation(workspaceId: string, userId: string, conversationId: string, updateConversationDto: UpdateConversationDto) {
    const { title, status } = updateConversationDto;
    
    const result = await this.databaseService.query(
      `UPDATE ai_conversations 
       SET title = COALESCE($1, title),
           status = COALESCE($2, status),
           updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4 AND user_id = $5
       RETURNING *`,
      [title, status, conversationId, workspaceId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return result[0];
  }

  async deleteConversation(workspaceId: string, userId: string, conversationId: string) {
    const result = await this.databaseService.query(
      `UPDATE ai_conversations 
       SET status = 'deleted', updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND user_id = $3
       RETURNING *`,
      [conversationId, workspaceId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return { message: 'Conversa deletada com sucesso' };
  }

  // Mensagens
  async sendMessage(workspaceId: string, userId: string, conversationId: string, sendMessageDto: SendMessageDto) {
    const { content, metadata } = sendMessageDto;
    
    // Verificar se a conversa existe
    const conversation = await this.getConversationById(workspaceId, userId, conversationId);
    
    // Inserir mensagem do usuário
    const userMessage = await this.databaseService.query(
      `INSERT INTO ai_messages (conversation_id, role, content, metadata)
       VALUES ($1, 'user', $2, $3)
       RETURNING *`,
      [conversationId, content, metadata || {}]
    );

    // Simular resposta da IA (aqui você integraria com OpenAI, Claude, etc.)
    const aiResponse = await this.generateAIResponse(conversation, content);
    
    // Inserir resposta da IA
    const aiMessage = await this.databaseService.query(
      `INSERT INTO ai_messages (conversation_id, role, content, metadata, tokens_used)
       VALUES ($1, 'assistant', $2, $3, $4)
       RETURNING *`,
      [conversationId, aiResponse.content, aiResponse.metadata, aiResponse.tokens_used]
    );

    // Atualizar timestamp da conversa
    await this.databaseService.query(
      'UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    return {
      user_message: userMessage[0],
      ai_message: aiMessage[0]
    };
  }

  async getMessages(workspaceId: string, userId: string, conversationId: string) {
    // Verificar se a conversa existe e pertence ao usuário
    await this.getConversationById(workspaceId, userId, conversationId);
    
    const result = await this.databaseService.query(
      `SELECT * FROM ai_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    return result;
  }

  // Sugestões de workflow
  async createWorkflowSuggestion(workspaceId: string, userId: string, conversationId: string, createSuggestionDto: CreateWorkflowSuggestionDto) {
    const { title, description, workflow_definition, suggestion_type, confidence_score } = createSuggestionDto;
    
    // Verificar se a conversa existe
    await this.getConversationById(workspaceId, userId, conversationId);
    
    const result = await this.databaseService.query(
      `INSERT INTO ai_workflow_suggestions (conversation_id, user_id, suggestion_type, title, description, workflow_definition, confidence_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [conversationId, userId, suggestion_type, title, description, workflow_definition, confidence_score]
    );

    return result[0];
  }

  async getWorkflowSuggestions(workspaceId: string, userId: string, conversationId?: string) {
    let whereClause = 'WHERE s.user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (conversationId) {
      whereClause += ` AND s.conversation_id = $${paramIndex}`;
      params.push(conversationId);
    }

    const result = await this.databaseService.query(
      `SELECT s.*, c.title as conversation_title
       FROM ai_workflow_suggestions s
       LEFT JOIN ai_conversations c ON s.conversation_id = c.id
       ${whereClause}
       ORDER BY s.created_at DESC`,
      params
    );

    return result;
  }

  async updateWorkflowSuggestionStatus(workspaceId: string, userId: string, suggestionId: string, status: string) {
    const result = await this.databaseService.query(
      `UPDATE ai_workflow_suggestions 
       SET status = $1, applied_at = CASE WHEN $1 = 'accepted' THEN NOW() ELSE applied_at END
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, suggestionId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Sugestão não encontrada');
    }

    return result[0];
  }

  // Configurações de IA do workspace
  async getWorkspaceAISettings(workspaceId: string) {
    const result = await this.databaseService.query(
      'SELECT * FROM workspace_ai_settings WHERE workspace_id = $1',
      [workspaceId]
    );

    if (result.length === 0) {
      // Retornar configurações padrão se não existir
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

  async updateWorkspaceAISettings(workspaceId: string, settings: any) {
    const {
      model_name,
      max_tokens,
      temperature,
      enable_workflow_suggestions,
      enable_code_generation,
      custom_instructions
    } = settings;

    const result = await this.databaseService.query(
      `INSERT INTO workspace_ai_settings (workspace_id, model_name, max_tokens, temperature, enable_workflow_suggestions, enable_code_generation, custom_instructions)
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
       RETURNING *`,
      [workspaceId, model_name, max_tokens, temperature, enable_workflow_suggestions, enable_code_generation, custom_instructions]
    );

    return result[0];
  }

  // Método privado para gerar resposta da IA (simulado)
  private async generateAIResponse(conversation: any, userMessage: string) {
    // Aqui você integraria com OpenAI, Claude, ou outro provedor de IA
    // Por enquanto, retornamos uma resposta simulada
    
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
}
