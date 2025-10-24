import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { CreateVariableDto, UpdateVariableDto, CreateWorkspaceVariableDto, UpdateWorkspaceVariableDto } from './dto/variables.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/variables')
@UseGuards(JwtAuthGuard)
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  // Variáveis globais do sistema
  @Post()
  createGlobalVariable(@Body() createVariableDto: CreateVariableDto, @CurrentUser() user: any) {
    return this.variablesService.createGlobalVariable(createVariableDto, user.id);
  }

  @Get()
  getGlobalVariables() {
    return this.variablesService.getGlobalVariables();
  }

  @Get(':id')
  getGlobalVariableById(@Param('id') id: string) {
    return this.variablesService.getGlobalVariableById(id);
  }

  @Put(':id')
  updateGlobalVariable(@Param('id') id: string, @Body() updateVariableDto: UpdateVariableDto, @CurrentUser() user: any) {
    return this.variablesService.updateGlobalVariable(id, updateVariableDto, user.id);
  }

  @Delete(':id')
  deleteGlobalVariable(@Param('id') id: string) {
    return this.variablesService.deleteGlobalVariable(id);
  }

  // Variáveis do workspace
  @Post('workspace')
  @UseGuards(RequireWorkspaceGuard)
  createWorkspaceVariable(@Body() createVariableDto: CreateWorkspaceVariableDto, @CurrentUser() user: any, @Req() req: any) {
    return this.variablesService.createWorkspaceVariable(req.workspace.id, createVariableDto, user.id);
  }

  @Get('workspace')
  @UseGuards(RequireWorkspaceGuard)
  getWorkspaceVariables(@Req() req: any) {
    return this.variablesService.getWorkspaceVariables(req.workspace.id);
  }

  @Get('workspace/:id')
  @UseGuards(RequireWorkspaceGuard)
  getWorkspaceVariableById(@Param('id') id: string, @Req() req: any) {
    return this.variablesService.getWorkspaceVariableById(req.workspace.id, id);
  }

  @Put('workspace/:id')
  @UseGuards(RequireWorkspaceGuard)
  updateWorkspaceVariable(@Param('id') id: string, @Body() updateVariableDto: UpdateWorkspaceVariableDto, @CurrentUser() user: any, @Req() req: any) {
    return this.variablesService.updateWorkspaceVariable(req.workspace.id, id, updateVariableDto, user.id);
  }

  @Delete('workspace/:id')
  @UseGuards(RequireWorkspaceGuard)
  deleteWorkspaceVariable(@Param('id') id: string, @Req() req: any) {
    return this.variablesService.deleteWorkspaceVariable(req.workspace.id, id);
  }

  // Buscar variável por nome
  @Get('search/:name')
  @UseGuards(RequireWorkspaceGuard)
  getVariableByName(@Param('name') name: string, @Req() req: any) {
    return this.variablesService.getVariableByName(req.workspace.id, name);
  }
}
