import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TemplateInstallsService } from './template-installs.service';

@Controller('api/template-installs')
@UseGuards(JwtAuthGuard)
export class TemplateInstallsController {
  constructor(private readonly templateInstallsService: TemplateInstallsService) {}

  @Get()
  async getTemplateInstalls(
    @Query('workspaceId') workspaceId: string,
    @Query('templateId') templateId?: string,
    @Query('status') status?: string
  ) {
    return this.templateInstallsService.getTemplateInstalls(workspaceId, { templateId, status });
  }

  @Get(':id')
  async getTemplateInstall(@Param('id') id: string) {
    return this.templateInstallsService.getTemplateInstall(id);
  }

  @Post()
  async createTemplateInstall(@Body() createTemplateInstallDto: any) {
    return this.templateInstallsService.createTemplateInstall(createTemplateInstallDto);
  }

  @Put(':id')
  async updateTemplateInstall(@Param('id') id: string, @Body() updateTemplateInstallDto: any) {
    return this.templateInstallsService.updateTemplateInstall(id, updateTemplateInstallDto);
  }

  @Delete(':id')
  async deleteTemplateInstall(@Param('id') id: string) {
    return this.templateInstallsService.deleteTemplateInstall(id);
  }
}
