import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ProjectSharingService } from './project-sharing.service';
import { ShareProjectDto, UpdateSharedProjectDto, CreateProjectPermissionDto, UpdateProjectPermissionDto, CreateProjectCommentDto, UpdateProjectCommentDto, GetSharedProjectsDto, ForkProjectDto } from './dto/project-sharing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/project-sharing')
export class ProjectSharingController {
  constructor(private readonly projectSharingService: ProjectSharingService) {}

  // Compartilhar projeto
  @Post('workflows/:workflowId/share')
  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  shareProject(@Param('workflowId') workflowId: string, @Body() shareProjectDto: ShareProjectDto, @CurrentUser() user: any, @Req() req: any) {
    return this.projectSharingService.shareProject(req.workspace.id, workflowId, user.id, shareProjectDto);
  }

  // Listar projetos compartilhados
  @Get('projects')
  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  getSharedProjects(@Query() query: GetSharedProjectsDto, @Req() req: any) {
    return this.projectSharingService.getSharedProjects(req.workspace.id, query);
  }

  // Obter projeto compartilhado por token (público)
  @Get('shared/:token')
  getSharedProjectByToken(@Param('token') token: string) {
    return this.projectSharingService.getSharedProjectByToken(token);
  }

  // Atualizar projeto compartilhado
  @Put('projects/:id')
  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  updateSharedProject(@Param('id') id: string, @Body() updateSharedProjectDto: UpdateSharedProjectDto, @CurrentUser() user: any, @Req() req: any) {
    return this.projectSharingService.updateSharedProject(req.workspace.id, id, user.id, updateSharedProjectDto);
  }

  // Deletar projeto compartilhado
  @Delete('projects/:id')
  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  deleteSharedProject(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.projectSharingService.deleteSharedProject(req.workspace.id, id, user.id);
  }

  // Fork de projeto
  @Post('projects/:id/fork')
  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  forkProject(@Param('id') id: string, @Body() forkProjectDto: ForkProjectDto, @CurrentUser() user: any, @Req() req: any) {
    return this.projectSharingService.forkProject(req.workspace.id, id, user.id, forkProjectDto);
  }

  // Comentários
  @Post('projects/:id/comments')
  @UseGuards(JwtAuthGuard)
  createComment(@Param('id') id: string, @Body() createCommentDto: CreateProjectCommentDto, @CurrentUser() user: any) {
    return this.projectSharingService.createComment(id, user.id, createCommentDto);
  }

  @Get('projects/:id/comments')
  getComments(@Param('id') id: string) {
    return this.projectSharingService.getComments(id);
  }

  // Likes
  @Post('projects/:id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectSharingService.toggleLike(id, user.id);
  }

  @Get('projects/:id/likes')
  getLikes(@Param('id') id: string) {
    return this.projectSharingService.getLikes(id);
  }
}
