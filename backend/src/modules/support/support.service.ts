import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { CreateTicketDto, UpdateTicketDto, CreateTicketMessageDto, UpdateTicketMessageDto, CreateTicketRatingDto, GetTicketsDto, CreateCategoryDto, UpdateCategoryDto, CreatePriorityDto, UpdatePriorityDto } from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Tickets
  async createTicket(workspaceId: string, userId: string, createTicketDto: CreateTicketDto) {
    const { title, description, category_id, priority_id, tags, metadata } = createTicketDto;
    
    // Gerar número do ticket
    const ticketNumber = await this.generateTicketNumber();
    
    // Obter status inicial (open)
    const status = await this.databaseService.query(
      'SELECT id FROM support_statuses WHERE name = $1',
      ['open']
    );

    const result = await this.databaseService.query(
      `INSERT INTO support_tickets (workspace_id, user_id, ticket_number, title, description, category_id, priority_id, status_id, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [workspaceId, userId, ticketNumber, title, description, category_id, priority_id, status[0].id, tags || [], metadata || '{}']
    );

    return result[0];
  }

  async getTickets(workspaceId: string, userId: string, query: GetTicketsDto) {
    const { category_id, priority_id, status_id, assigned_to, search, limit, offset } = query;
    
    let whereClause = 'WHERE t.workspace_id = $1';
    const params: any[] = [workspaceId];
    let paramIndex = 2;

    // Filtrar por usuário (usuários só veem seus próprios tickets, exceto se forem admin)
    const userRole = await this.getUserRole(workspaceId, userId);
    if (userRole !== 'admin') {
      whereClause += ` AND t.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (category_id) {
      whereClause += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (priority_id) {
      whereClause += ` AND t.priority_id = $${paramIndex}`;
      params.push(priority_id);
      paramIndex++;
    }

    if (status_id) {
      whereClause += ` AND t.status_id = $${paramIndex}`;
      params.push(status_id);
      paramIndex++;
    }

    if (assigned_to) {
      whereClause += ` AND t.assigned_to = $${paramIndex}`;
      params.push(assigned_to);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const result = await this.databaseService.query(
      `SELECT t.*, 
              c.name as category_name, c.color as category_color,
              p.name as priority_name, p.color as priority_color, p.level as priority_level,
              s.name as status_name, s.color as status_color,
              u.display_name as user_name,
              a.display_name as assigned_to_name
       FROM support_tickets t
       LEFT JOIN support_categories c ON t.category_id = c.id
       LEFT JOIN support_priorities p ON t.priority_id = p.id
       LEFT JOIN support_statuses s ON t.status_id = s.id
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return result;
  }

  async getTicketById(workspaceId: string, userId: string, ticketId: string) {
    const userRole = await this.getUserRole(workspaceId, userId);
    
    let whereClause = 'WHERE t.id = $1 AND t.workspace_id = $2';
    const params: any[] = [ticketId, workspaceId];
    let paramIndex = 3;

    if (userRole !== 'admin') {
      whereClause += ` AND t.user_id = $${paramIndex}`;
      params.push(userId);
    }

    const result = await this.databaseService.query(
      `SELECT t.*, 
              c.name as category_name, c.color as category_color,
              p.name as priority_name, p.color as priority_color, p.level as priority_level,
              s.name as status_name, s.color as status_color,
              u.display_name as user_name,
              a.display_name as assigned_to_name
       FROM support_tickets t
       LEFT JOIN support_categories c ON t.category_id = c.id
       LEFT JOIN support_priorities p ON t.priority_id = p.id
       LEFT JOIN support_statuses s ON t.status_id = s.id
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ${whereClause}`,
      params
    );

    if (result.length === 0) {
      throw new NotFoundException('Ticket não encontrado');
    }

    return result[0];
  }

  async updateTicket(workspaceId: string, userId: string, ticketId: string, updateTicketDto: UpdateTicketDto) {
    const userRole = await this.getUserRole(workspaceId, userId);
    
    // Verificar se o usuário pode editar o ticket
    if (userRole !== 'admin') {
      const ticket = await this.getTicketById(workspaceId, userId, ticketId);
      if (ticket.user_id !== userId) {
        throw new ForbiddenException('Você não tem permissão para editar este ticket');
      }
    }

    const {
      title, description, category_id, priority_id, status_id, assigned_to, tags, metadata
    } = updateTicketDto;

    const result = await this.databaseService.query(
      `UPDATE support_tickets 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           priority_id = COALESCE($4, priority_id),
           status_id = COALESCE($5, status_id),
           assigned_to = COALESCE($6, assigned_to),
           tags = COALESCE($7, tags),
           metadata = COALESCE($8, metadata),
           updated_at = NOW()
       WHERE id = $9 AND workspace_id = $10
       RETURNING *`,
      [title, description, category_id, priority_id, status_id, assigned_to, tags, metadata, ticketId, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Ticket não encontrado');
    }

    // Registrar mudança no histórico
    await this.recordTicketHistory(ticketId, userId, 'updated', null, null);

    return result[0];
  }

  async deleteTicket(workspaceId: string, userId: string, ticketId: string) {
    const userRole = await this.getUserRole(workspaceId, userId);
    
    if (userRole !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem deletar tickets');
    }

    const result = await this.databaseService.query(
      'DELETE FROM support_tickets WHERE id = $1 AND workspace_id = $2 RETURNING *',
      [ticketId, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Ticket não encontrado');
    }

    return { message: 'Ticket deletado com sucesso' };
  }

  // Mensagens dos tickets
  async createTicketMessage(workspaceId: string, userId: string, ticketId: string, createMessageDto: CreateTicketMessageDto) {
    // Verificar se o ticket existe e o usuário tem acesso
    await this.getTicketById(workspaceId, userId, ticketId);
    
    const { message, metadata } = createMessageDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO support_ticket_messages (ticket_id, user_id, message, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ticketId, userId, message, metadata || '{}']
    );

    // Atualizar timestamp do ticket
    await this.databaseService.query(
      'UPDATE support_tickets SET updated_at = NOW() WHERE id = $1',
      [ticketId]
    );

    return result[0];
  }

  async getTicketMessages(workspaceId: string, userId: string, ticketId: string) {
    // Verificar se o ticket existe e o usuário tem acesso
    await this.getTicketById(workspaceId, userId, ticketId);
    
    const result = await this.databaseService.query(
      `SELECT m.*, u.display_name as user_name
       FROM support_ticket_messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`,
      [ticketId]
    );

    return result;
  }

  async updateTicketMessage(workspaceId: string, userId: string, messageId: string, updateMessageDto: UpdateTicketMessageDto) {
    const { message, metadata } = updateMessageDto;
    
    const result = await this.databaseService.query(
      `UPDATE support_ticket_messages 
       SET message = COALESCE($1, message),
           metadata = COALESCE($2, metadata)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [message, metadata, messageId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return result[0];
  }

  async deleteTicketMessage(workspaceId: string, userId: string, messageId: string) {
    const result = await this.databaseService.query(
      'DELETE FROM support_ticket_messages WHERE id = $1 AND user_id = $2 RETURNING *',
      [messageId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return { message: 'Mensagem deletada com sucesso' };
  }

  // Avaliações
  async createTicketRating(workspaceId: string, userId: string, ticketId: string, createRatingDto: CreateTicketRatingDto) {
    // Verificar se o ticket existe e o usuário tem acesso
    await this.getTicketById(workspaceId, userId, ticketId);
    
    const { rating, comment } = createRatingDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO support_ticket_ratings (ticket_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (ticket_id, user_id) 
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`,
      [ticketId, userId, rating, comment]
    );

    return result[0];
  }

  async getTicketRatings(workspaceId: string, ticketId: string) {
    const result = await this.databaseService.query(
      `SELECT r.*, u.display_name as user_name
       FROM support_ticket_ratings r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.ticket_id = $1
       ORDER BY r.created_at DESC`,
      [ticketId]
    );

    return result;
  }

  // Categorias
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const { name, description, color } = createCategoryDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO support_categories (name, description, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, color]
    );

    return result[0];
  }

  async getCategories() {
    const result = await this.databaseService.query(
      'SELECT * FROM support_categories ORDER BY name'
    );
    return result;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, description, color } = updateCategoryDto;
    
    const result = await this.databaseService.query(
      `UPDATE support_categories 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, color, id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return result[0];
  }

  async deleteCategory(id: string) {
    const result = await this.databaseService.query(
      'DELETE FROM support_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return { message: 'Categoria deletada com sucesso' };
  }

  // Prioridades
  async createPriority(createPriorityDto: CreatePriorityDto) {
    const { name, description, color, level, sla_hours } = createPriorityDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO support_priorities (name, description, color, level, sla_hours)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, color, level, sla_hours]
    );

    return result[0];
  }

  async getPriorities() {
    const result = await this.databaseService.query(
      'SELECT * FROM support_priorities ORDER BY level'
    );
    return result;
  }

  async updatePriority(id: string, updatePriorityDto: UpdatePriorityDto) {
    const { name, description, color, level, sla_hours } = updatePriorityDto;
    
    const result = await this.databaseService.query(
      `UPDATE support_priorities 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           level = COALESCE($4, level),
           sla_hours = COALESCE($5, sla_hours),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, color, level, sla_hours, id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Prioridade não encontrada');
    }

    return result[0];
  }

  async deletePriority(id: string) {
    const result = await this.databaseService.query(
      'DELETE FROM support_priorities WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Prioridade não encontrada');
    }

    return { message: 'Prioridade deletada com sucesso' };
  }

  // Status
  async getStatuses() {
    const result = await this.databaseService.query(
      'SELECT * FROM support_statuses ORDER BY name'
    );
    return result;
  }

  // Métodos auxiliares
  private async generateTicketNumber(): Promise<string> {
    const result = await this.databaseService.query(
      'SELECT COUNT(*) as count FROM support_tickets WHERE created_at >= CURRENT_DATE'
    );
    
    const count = parseInt(result[0].count) + 1;
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    return `TICKET-${date}-${count.toString().padStart(4, '0')}`;
  }

  private async getUserRole(workspaceId: string, userId: string): Promise<string> {
    const result = await this.databaseService.query(
      `SELECT p.code as role
       FROM workspace_members wm
       JOIN profiles p ON wm.profile_id = p.id
       WHERE wm.workspace_id = $1 AND wm.user_id = $2 AND wm.status = 'active'`,
      [workspaceId, userId]
    );

    return result.length > 0 ? result[0].role : 'user';
  }

  private async recordTicketHistory(ticketId: string, userId: string, fieldName: string, oldValue: string | null, newValue: string | null) {
    await this.databaseService.query(
      `INSERT INTO support_ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticketId, userId, fieldName, oldValue, newValue]
    );
  }
}
