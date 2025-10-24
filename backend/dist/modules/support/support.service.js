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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let SupportService = class SupportService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createTicket(workspaceId, userId, createTicketDto) {
        const { title, description, category_id, priority_id, tags, metadata } = createTicketDto;
        const ticketNumber = await this.generateTicketNumber();
        const status = await this.databaseService.query('SELECT id FROM support_statuses WHERE name = $1', ['open']);
        const result = await this.databaseService.query(`INSERT INTO support_tickets (workspace_id, user_id, ticket_number, title, description, category_id, priority_id, status_id, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`, [workspaceId, userId, ticketNumber, title, description, category_id, priority_id, status[0].id, tags || [], metadata || '{}']);
        return result[0];
    }
    async getTickets(workspaceId, userId, query) {
        const { category_id, priority_id, status_id, assigned_to, search, limit, offset } = query;
        let whereClause = 'WHERE t.workspace_id = $1';
        const params = [workspaceId];
        let paramIndex = 2;
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
        const result = await this.databaseService.query(`SELECT t.*, 
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
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, offset]);
        return result;
    }
    async getTicketById(workspaceId, userId, ticketId) {
        const userRole = await this.getUserRole(workspaceId, userId);
        let whereClause = 'WHERE t.id = $1 AND t.workspace_id = $2';
        const params = [ticketId, workspaceId];
        let paramIndex = 3;
        if (userRole !== 'admin') {
            whereClause += ` AND t.user_id = $${paramIndex}`;
            params.push(userId);
        }
        const result = await this.databaseService.query(`SELECT t.*, 
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
       ${whereClause}`, params);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        return result[0];
    }
    async updateTicket(workspaceId, userId, ticketId, updateTicketDto) {
        const userRole = await this.getUserRole(workspaceId, userId);
        if (userRole !== 'admin') {
            const ticket = await this.getTicketById(workspaceId, userId, ticketId);
            if (ticket.user_id !== userId) {
                throw new common_1.ForbiddenException('Você não tem permissão para editar este ticket');
            }
        }
        const { title, description, category_id, priority_id, status_id, assigned_to, tags, metadata } = updateTicketDto;
        const result = await this.databaseService.query(`UPDATE support_tickets 
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
       RETURNING *`, [title, description, category_id, priority_id, status_id, assigned_to, tags, metadata, ticketId, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        await this.recordTicketHistory(ticketId, userId, 'updated', null, null);
        return result[0];
    }
    async deleteTicket(workspaceId, userId, ticketId) {
        const userRole = await this.getUserRole(workspaceId, userId);
        if (userRole !== 'admin') {
            throw new common_1.ForbiddenException('Apenas administradores podem deletar tickets');
        }
        const result = await this.databaseService.query('DELETE FROM support_tickets WHERE id = $1 AND workspace_id = $2 RETURNING *', [ticketId, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        return { message: 'Ticket deletado com sucesso' };
    }
    async createTicketMessage(workspaceId, userId, ticketId, createMessageDto) {
        await this.getTicketById(workspaceId, userId, ticketId);
        const { message, metadata } = createMessageDto;
        const result = await this.databaseService.query(`INSERT INTO support_ticket_messages (ticket_id, user_id, message, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [ticketId, userId, message, metadata || '{}']);
        await this.databaseService.query('UPDATE support_tickets SET updated_at = NOW() WHERE id = $1', [ticketId]);
        return result[0];
    }
    async getTicketMessages(workspaceId, userId, ticketId) {
        await this.getTicketById(workspaceId, userId, ticketId);
        const result = await this.databaseService.query(`SELECT m.*, u.display_name as user_name
       FROM support_ticket_messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`, [ticketId]);
        return result;
    }
    async updateTicketMessage(workspaceId, userId, messageId, updateMessageDto) {
        const { message, metadata } = updateMessageDto;
        const result = await this.databaseService.query(`UPDATE support_ticket_messages 
       SET message = COALESCE($1, message),
           metadata = COALESCE($2, metadata)
       WHERE id = $3 AND user_id = $4
       RETURNING *`, [message, metadata, messageId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Mensagem não encontrada');
        }
        return result[0];
    }
    async deleteTicketMessage(workspaceId, userId, messageId) {
        const result = await this.databaseService.query('DELETE FROM support_ticket_messages WHERE id = $1 AND user_id = $2 RETURNING *', [messageId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Mensagem não encontrada');
        }
        return { message: 'Mensagem deletada com sucesso' };
    }
    async createTicketRating(workspaceId, userId, ticketId, createRatingDto) {
        await this.getTicketById(workspaceId, userId, ticketId);
        const { rating, comment } = createRatingDto;
        const result = await this.databaseService.query(`INSERT INTO support_ticket_ratings (ticket_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (ticket_id, user_id) 
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`, [ticketId, userId, rating, comment]);
        return result[0];
    }
    async getTicketRatings(workspaceId, ticketId) {
        const result = await this.databaseService.query(`SELECT r.*, u.display_name as user_name
       FROM support_ticket_ratings r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.ticket_id = $1
       ORDER BY r.created_at DESC`, [ticketId]);
        return result;
    }
    async createCategory(createCategoryDto) {
        const { name, description, color } = createCategoryDto;
        const result = await this.databaseService.query(`INSERT INTO support_categories (name, description, color)
       VALUES ($1, $2, $3)
       RETURNING *`, [name, description, color]);
        return result[0];
    }
    async getCategories() {
        const result = await this.databaseService.query('SELECT * FROM support_categories ORDER BY name');
        return result;
    }
    async updateCategory(id, updateCategoryDto) {
        const { name, description, color } = updateCategoryDto;
        const result = await this.databaseService.query(`UPDATE support_categories 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`, [name, description, color, id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return result[0];
    }
    async deleteCategory(id) {
        const result = await this.databaseService.query('DELETE FROM support_categories WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return { message: 'Categoria deletada com sucesso' };
    }
    async createPriority(createPriorityDto) {
        const { name, description, color, level, sla_hours } = createPriorityDto;
        const result = await this.databaseService.query(`INSERT INTO support_priorities (name, description, color, level, sla_hours)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [name, description, color, level, sla_hours]);
        return result[0];
    }
    async getPriorities() {
        const result = await this.databaseService.query('SELECT * FROM support_priorities ORDER BY level');
        return result;
    }
    async updatePriority(id, updatePriorityDto) {
        const { name, description, color, level, sla_hours } = updatePriorityDto;
        const result = await this.databaseService.query(`UPDATE support_priorities 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           level = COALESCE($4, level),
           sla_hours = COALESCE($5, sla_hours),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`, [name, description, color, level, sla_hours, id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Prioridade não encontrada');
        }
        return result[0];
    }
    async deletePriority(id) {
        const result = await this.databaseService.query('DELETE FROM support_priorities WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Prioridade não encontrada');
        }
        return { message: 'Prioridade deletada com sucesso' };
    }
    async getStatuses() {
        const result = await this.databaseService.query('SELECT * FROM support_statuses ORDER BY name');
        return result;
    }
    async generateTicketNumber() {
        const result = await this.databaseService.query('SELECT COUNT(*) as count FROM support_tickets WHERE created_at >= CURRENT_DATE');
        const count = parseInt(result[0].count) + 1;
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `TICKET-${date}-${count.toString().padStart(4, '0')}`;
    }
    async getUserRole(workspaceId, userId) {
        const result = await this.databaseService.query(`SELECT p.code as role
       FROM workspace_members wm
       JOIN profiles p ON wm.profile_id = p.id
       WHERE wm.workspace_id = $1 AND wm.user_id = $2 AND wm.status = 'active'`, [workspaceId, userId]);
        return result.length > 0 ? result[0].role : 'user';
    }
    async recordTicketHistory(ticketId, userId, fieldName, oldValue, newValue) {
        await this.databaseService.query(`INSERT INTO support_ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5)`, [ticketId, userId, fieldName, oldValue, newValue]);
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SupportService);
//# sourceMappingURL=support.service.js.map