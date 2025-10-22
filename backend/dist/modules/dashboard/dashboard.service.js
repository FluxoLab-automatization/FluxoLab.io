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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let DashboardService = class DashboardService {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async getOverview(workspaceId) {
        const [workflowsResult, executionsResult, credentialsResult] = await Promise.all([
            this.pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active
        FROM workflows 
        WHERE workspace_id = $1 AND deleted_at IS NULL
      `, [workspaceId]),
            this.pool.query(`
        SELECT 
          COUNT(*) as total,
          MAX(created_at) as last_execution
        FROM workflow_executions 
        WHERE workspace_id = $1
      `, [workspaceId]),
            this.pool.query(`
        SELECT COUNT(*) as total
        FROM workflow_credentials 
        WHERE workspace_id = $1
      `, [workspaceId]),
        ]);
        const trialInfo = {
            daysLeft: 5,
            executionsUsed: 6,
            executionsLimit: 1000,
            isTrial: true,
        };
        return {
            totalWorkflows: parseInt(workflowsResult.rows[0].total),
            activeWorkflows: parseInt(workflowsResult.rows[0].active),
            totalExecutions: parseInt(executionsResult.rows[0].total),
            totalCredentials: parseInt(credentialsResult.rows[0].total),
            lastExecutionAt: executionsResult.rows[0].last_execution,
            trialInfo,
        };
    }
    async getStats(workspaceId, period) {
        const periodDays = this.parsePeriod(period);
        const result = await this.pool.query(`
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_executions,
        AVG(CASE WHEN finished_at IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (finished_at - created_at)) 
        END) as avg_duration_seconds
      FROM workflow_executions 
      WHERE workspace_id = $1 
        AND created_at >= NOW() - INTERVAL '${periodDays} days'
    `, [workspaceId]);
        const row = result.rows[0];
        const totalExecutions = parseInt(row.total_executions);
        const successfulExecutions = parseInt(row.successful_executions);
        const failedExecutions = parseInt(row.failed_executions);
        const failureRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;
        const avgDurationSeconds = parseFloat(row.avg_duration_seconds) || 0;
        return {
            prodExecutions: successfulExecutions,
            failedExecutions,
            failureRate: Math.round(failureRate * 100) / 100,
            timeSaved: null,
            avgRunTime: avgDurationSeconds > 0 ? `${avgDurationSeconds.toFixed(2)}s` : null,
        };
    }
    async getWorkflows(workspaceId, options) {
        let whereClause = 'w.workspace_id = $1 AND w.deleted_at IS NULL';
        const params = [workspaceId];
        let paramIndex = 2;
        if (options.search) {
            whereClause += ` AND w.name ILIKE $${paramIndex}`;
            params.push(`%${options.search}%`);
            paramIndex++;
        }
        if (options.status) {
            whereClause += ` AND w.status = $${paramIndex}`;
            params.push(options.status);
            paramIndex++;
        }
        const sortColumn = this.getSortColumn(options.sortBy || 'updated_at');
        const orderDirection = options.sortBy?.startsWith('-') ? 'DESC' : 'ASC';
        const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM workflows w
      WHERE ${whereClause}
    `, params);
        const total = parseInt(countResult.rows[0].total);
        const workflowsResult = await this.pool.query(`
      SELECT 
        w.id,
        w.name,
        w.status,
        w.tags,
        w.created_at,
        w.updated_at,
        u.name as owner_name,
        COALESCE(exec_count.count, 0) as execution_count
      FROM workflows w
      LEFT JOIN users u ON u.id = w.created_by
      LEFT JOIN (
        SELECT 
          workflow_id,
          COUNT(*) as count
        FROM workflow_executions
        WHERE workspace_id = $1
        GROUP BY workflow_id
      ) exec_count ON exec_count.workflow_id = w.id
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, options.limit, options.offset]);
        const workflows = workflowsResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            status: row.status,
            owner: row.owner_name || 'Personal',
            lastUpdated: row.updated_at,
            createdAt: row.created_at,
            executionCount: parseInt(row.execution_count),
            tags: row.tags || [],
        }));
        return { workflows, total };
    }
    async getExecutions(workspaceId, options) {
        let whereClause = 'e.workspace_id = $1';
        const params = [workspaceId];
        let paramIndex = 2;
        if (options.workflowId) {
            whereClause += ` AND e.workflow_id = $${paramIndex}`;
            params.push(options.workflowId);
            paramIndex++;
        }
        const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM workflow_executions e
      WHERE ${whereClause}
    `, params);
        const total = parseInt(countResult.rows[0].total);
        const executionsResult = await this.pool.query(`
      SELECT 
        e.id,
        e.workflow_id,
        w.name as workflow_name,
        e.status,
        e.created_at as started_at,
        e.finished_at,
        CASE 
          WHEN e.finished_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (e.finished_at - e.created_at))
          ELSE NULL
        END as duration,
        e.error_message
      FROM workflow_executions e
      LEFT JOIN workflows w ON w.id = e.workflow_id
      WHERE ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, options.limit, options.offset]);
        const executions = executionsResult.rows.map(row => ({
            id: row.id,
            workflowId: row.workflow_id,
            workflowName: row.workflow_name,
            status: row.status,
            startedAt: row.started_at,
            finishedAt: row.finished_at,
            duration: row.duration ? Math.round(row.duration * 100) / 100 : null,
            errorMessage: row.error_message,
        }));
        return { executions, total };
    }
    async getCredentials(workspaceId, options) {
        const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM workflow_credentials
      WHERE workspace_id = $1 AND deleted_at IS NULL
    `, [workspaceId]);
        const total = parseInt(countResult.rows[0].total);
        const credentialsResult = await this.pool.query(`
      SELECT 
        id,
        name,
        type,
        created_at,
        last_used_at,
        is_active
      FROM workflow_credentials
      WHERE workspace_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [workspaceId, options.limit, options.offset]);
        const credentials = credentialsResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            createdAt: row.created_at,
            lastUsedAt: row.last_used_at,
            isActive: row.is_active,
        }));
        return { credentials, total };
    }
    parsePeriod(period) {
        const match = period.match(/^(\d+)([dwmy])$/);
        if (!match)
            return 7;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 'd': return value;
            case 'w': return value * 7;
            case 'm': return value * 30;
            case 'y': return value * 365;
            default: return 7;
        }
    }
    getSortColumn(sortBy) {
        const column = sortBy.replace(/^-/, '');
        const validColumns = [
            'name', 'status', 'created_at', 'updated_at', 'execution_count'
        ];
        if (validColumns.includes(column)) {
            return column === 'execution_count' ? 'exec_count.count' : `w.${column}`;
        }
        return 'w.updated_at';
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map