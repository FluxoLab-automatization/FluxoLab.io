import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ConnectorsService } from './connectors.service';

@Controller('api/connectors')
@UseGuards(JwtAuthGuard)
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get()
  async getConnectors(
    @Query('workspaceId') workspaceId: string,
    @Query('category') category?: string,
    @Query('status') status?: string
  ) {
    return this.connectorsService.getConnectors(workspaceId, { category, status });
  }

  @Get(':id')
  async getConnector(@Param('id') id: string) {
    return this.connectorsService.getConnector(id);
  }

  @Post()
  async createConnector(@Body() createConnectorDto: any) {
    return this.connectorsService.createConnector(createConnectorDto);
  }

  @Put(':id')
  async updateConnector(@Param('id') id: string, @Body() updateConnectorDto: any) {
    return this.connectorsService.updateConnector(id, updateConnectorDto);
  }

  @Delete(':id')
  async deleteConnector(@Param('id') id: string) {
    return this.connectorsService.deleteConnector(id);
  }

  @Get(':id/actions')
  async getConnectorActions(@Param('id') id: string) {
    return this.connectorsService.getConnectorActions(id);
  }

  @Post(':id/test')
  async testConnector(@Param('id') id: string, @Body() testData: any) {
    return this.connectorsService.testConnector(id, testData);
  }
}
