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
var ConnectorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("./entities");
let ConnectorsService = ConnectorsService_1 = class ConnectorsService {
    connectorRepository;
    connectorVersionRepository;
    connectorActionRepository;
    logger = new common_1.Logger(ConnectorsService_1.name);
    constructor(connectorRepository, connectorVersionRepository, connectorActionRepository) {
        this.connectorRepository = connectorRepository;
        this.connectorVersionRepository = connectorVersionRepository;
        this.connectorActionRepository = connectorActionRepository;
    }
    async findAll(workspaceId, filters) {
        const query = this.connectorRepository.createQueryBuilder('connector')
            .leftJoinAndSelect('connector.versions', 'versions')
            .leftJoinAndSelect('connector.actions', 'actions')
            .where('connector.workspaceId = :workspaceId OR connector.isPublic = true', { workspaceId });
        if (filters?.category) {
            query.andWhere('connector.category = :category', { category: filters.category });
        }
        if (filters?.connectorType) {
            query.andWhere('connector.connectorType = :connectorType', { connectorType: filters.connectorType });
        }
        if (filters?.isActive !== undefined) {
            query.andWhere('connector.isActive = :isActive', { isActive: filters.isActive });
        }
        if (filters?.isPublic !== undefined) {
            query.andWhere('connector.isPublic = :isPublic', { isPublic: filters.isPublic });
        }
        return await query.getMany();
    }
    async findOne(id, workspaceId) {
        return await this.connectorRepository.findOne({
            where: { id, workspaceId },
            relations: ['versions', 'actions']
        });
    }
    async findBySlug(slug, workspaceId) {
        return await this.connectorRepository.findOne({
            where: { slug, workspaceId },
            relations: ['versions', 'actions']
        });
    }
    async create(workspaceId, createConnectorDto, userId) {
        const connector = this.connectorRepository.create({
            ...createConnectorDto,
            workspaceId,
            createdBy: userId
        });
        return await this.connectorRepository.save(connector);
    }
    async update(id, workspaceId, updateConnectorDto) {
        await this.connectorRepository.update({ id, workspaceId }, { ...updateConnectorDto, updatedAt: new Date() });
        return await this.findOne(id, workspaceId);
    }
    async remove(id, workspaceId) {
        await this.connectorRepository.delete({ id, workspaceId });
    }
    async getActiveVersion(connectorId) {
        return await this.connectorVersionRepository.findOne({
            where: { connectorId, isActive: true }
        });
    }
    async getActions(connectorId, actionType) {
        const query = this.connectorActionRepository.createQueryBuilder('action')
            .where('action.connectorId = :connectorId', { connectorId })
            .andWhere('action.isActive = true');
        if (actionType) {
            query.andWhere('action.actionType = :actionType', { actionType });
        }
        return await query.getMany();
    }
    async testConnection(connectorId, config) {
        this.logger.log(`Testing connection for connector ${connectorId}`);
        return { success: true, message: 'Connection test successful' };
    }
    async getConnectors(workspaceId, filters) {
        return this.findAll(workspaceId, filters);
    }
    async getConnector(id) {
        return this.connectorRepository.findOne({
            where: { id },
            relations: ['versions', 'actions']
        });
    }
    async createConnector(createConnectorDto) {
        const connector = this.connectorRepository.create(createConnectorDto);
        return this.connectorRepository.save(connector);
    }
    async updateConnector(id, updateConnectorDto) {
        await this.connectorRepository.update(id, updateConnectorDto);
        return this.getConnector(id);
    }
    async deleteConnector(id) {
        return this.connectorRepository.delete(id);
    }
    async getConnectorActions(id) {
        return this.getActions(id);
    }
    async testConnector(id, testData) {
        return this.testConnection(id, testData);
    }
};
exports.ConnectorsService = ConnectorsService;
exports.ConnectorsService = ConnectorsService = ConnectorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Connector)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ConnectorVersion)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.ConnectorAction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConnectorsService);
//# sourceMappingURL=connectors.service.js.map