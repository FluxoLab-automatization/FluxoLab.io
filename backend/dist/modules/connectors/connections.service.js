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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConnectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("./entities");
let ConnectionsService = ConnectionsService_1 = class ConnectionsService {
    connectionRepository;
    logger = new common_1.Logger(ConnectionsService_1.name);
    constructor(connectionRepository) {
        this.connectionRepository = connectionRepository;
    }
    async getConnections(workspaceId, filters) {
        const query = this.connectionRepository.createQueryBuilder('connection')
            .where('connection.workspaceId = :workspaceId', { workspaceId });
        if (filters?.connectorId) {
            query.andWhere('connection.connectorId = :connectorId', { connectorId: filters.connectorId });
        }
        if (filters?.status) {
            query.andWhere('connection.status = :status', { status: filters.status });
        }
        return query.getMany();
    }
    async getConnection(id) {
        return this.connectionRepository.findOne({ where: { id } });
    }
    async createConnection(createConnectionDto) {
        const connection = this.connectionRepository.create(createConnectionDto);
        return this.connectionRepository.save(connection);
    }
    async updateConnection(id, updateConnectionDto) {
        await this.connectionRepository.update(id, updateConnectionDto);
        return this.getConnection(id);
    }
    async deleteConnection(id) {
        return this.connectionRepository.delete(id);
    }
    async testConnection(id) {
        const connection = await this.getConnection(id);
        if (!connection) {
            throw new Error('Connection not found');
        }
        return { success: true, message: 'Connection test successful' };
    }
};
exports.ConnectionsService = ConnectionsService;
exports.ConnectionsService = ConnectionsService = ConnectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Connection)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConnectionsService);
//# sourceMappingURL=connections.service.js.map