import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';

@Controller('api/templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async getTemplates(
    @Query('workspaceId') workspaceId: string,
    @Query('category') category?: string,
    @Query('status') status?: string
  ) {
    return this.templatesService.getTemplates(workspaceId, { category, status });
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplate(id);
  }

  @Post()
  async createTemplate(@Body() createTemplateDto: any) {
    return this.templatesService.createTemplate(createTemplateDto);
  }

  @Put(':id')
  async updateTemplate(@Param('id') id: string, @Body() updateTemplateDto: any) {
    return this.templatesService.updateTemplate(id, updateTemplateDto);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templatesService.deleteTemplate(id);
  }

  @Post(':id/install')
  async installTemplate(@Param('id') id: string, @Body() installData: any) {
    return this.templatesService.installTemplate(id, installData);
  }
}
