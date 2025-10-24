import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from './entities';

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}

  async getConnections(workspaceId: string, filters?: any) {
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

  async getConnection(id: string) {
    return this.connectionRepository.findOne({ where: { id } });
  }

  async createConnection(createConnectionDto: any) {
    const connection = this.connectionRepository.create(createConnectionDto);
    return this.connectionRepository.save(connection);
  }

  async updateConnection(id: string, updateConnectionDto: any) {
    await this.connectionRepository.update(id, updateConnectionDto);
    return this.getConnection(id);
  }

  async deleteConnection(id: string) {
    return this.connectionRepository.delete(id);
  }

  async testConnection(id: string) {
    const connection = await this.getConnection(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Implementar teste de conexão
    return { success: true, message: 'Connection test successful' };
  }
}
