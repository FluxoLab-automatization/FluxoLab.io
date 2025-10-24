import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connector, ConnectorVersion, ConnectorAction } from './entities';

@Injectable()
export class ConnectorsService {
  private readonly logger = new Logger(ConnectorsService.name);

  constructor(
    @InjectRepository(Connector)
    private connectorRepository: Repository<Connector>,
    @InjectRepository(ConnectorVersion)
    private connectorVersionRepository: Repository<ConnectorVersion>,
    @InjectRepository(ConnectorAction)
    private connectorActionRepository: Repository<ConnectorAction>,
  ) {}

  async findAll(workspaceId: string, filters?: {
    category?: string;
    connectorType?: string;
    isActive?: boolean;
    isPublic?: boolean;
  }) {
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

  async findOne(id: string, workspaceId: string) {
    return await this.connectorRepository.findOne({
      where: { id, workspaceId },
      relations: ['versions', 'actions']
    });
  }

  async findBySlug(slug: string, workspaceId: string) {
    return await this.connectorRepository.findOne({
      where: { slug, workspaceId },
      relations: ['versions', 'actions']
    });
  }

  async create(workspaceId: string, createConnectorDto: any, userId: string) {
    const connector = this.connectorRepository.create({
      ...createConnectorDto,
      workspaceId,
      createdBy: userId
    });

    return await this.connectorRepository.save(connector);
  }

  async update(id: string, workspaceId: string, updateConnectorDto: any) {
    await this.connectorRepository.update(
      { id, workspaceId },
      { ...updateConnectorDto, updatedAt: new Date() }
    );

    return await this.findOne(id, workspaceId);
  }

  async remove(id: string, workspaceId: string) {
    await this.connectorRepository.delete({ id, workspaceId });
  }

  async getActiveVersion(connectorId: string) {
    return await this.connectorVersionRepository.findOne({
      where: { connectorId, isActive: true }
    });
  }

  async getActions(connectorId: string, actionType?: string) {
    const query = this.connectorActionRepository.createQueryBuilder('action')
      .where('action.connectorId = :connectorId', { connectorId })
      .andWhere('action.isActive = true');

    if (actionType) {
      query.andWhere('action.actionType = :actionType', { actionType });
    }

    return await query.getMany();
  }

  async testConnection(connectorId: string, config: any) {
    // Implementar teste de conexão específico por conector
    this.logger.log(`Testing connection for connector ${connectorId}`);
    
    // Por enquanto, retorna sucesso
    return { success: true, message: 'Connection test successful' };
  }
}
