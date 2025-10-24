import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ConnectionsService } from './connections.service';

@Controller('api/connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  async getConnections(
    @Query('workspaceId') workspaceId: string,
    @Query('connectorId') connectorId?: string,
    @Query('status') status?: string
  ) {
    return this.connectionsService.getConnections(workspaceId, { connectorId, status });
  }

  @Get(':id')
  async getConnection(@Param('id') id: string) {
    return this.connectionsService.getConnection(id);
  }

  @Post()
  async createConnection(@Body() createConnectionDto: any) {
    return this.connectionsService.createConnection(createConnectionDto);
  }

  @Put(':id')
  async updateConnection(@Param('id') id: string, @Body() updateConnectionDto: any) {
    return this.connectionsService.updateConnection(id, updateConnectionDto);
  }

  @Delete(':id')
  async deleteConnection(@Param('id') id: string) {
    return this.connectionsService.deleteConnection(id);
  }

  @Post(':id/test')
  async testConnection(@Param('id') id: string) {
    return this.connectionsService.testConnection(id);
  }
}
