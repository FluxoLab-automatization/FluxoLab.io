import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto, CreateTagCategoryDto, UpdateTagCategoryDto, AssignTagsToWorkflowDto } from './dto/tags.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // Categorias de tags
  @Post('categories')
  createTagCategory(@Body() createTagCategoryDto: CreateTagCategoryDto) {
    return this.tagsService.createTagCategory(createTagCategoryDto);
  }

  @Get('categories')
  getTagCategories() {
    return this.tagsService.getTagCategories();
  }

  @Get('categories/:id')
  getTagCategoryById(@Param('id') id: string) {
    return this.tagsService.getTagCategoryById(id);
  }

  @Put('categories/:id')
  updateTagCategory(@Param('id') id: string, @Body() updateTagCategoryDto: UpdateTagCategoryDto) {
    return this.tagsService.updateTagCategory(id, updateTagCategoryDto);
  }

  @Delete('categories/:id')
  deleteTagCategory(@Param('id') id: string) {
    return this.tagsService.deleteTagCategory(id);
  }

  // Tags
  @Post()
  @UseGuards(RequireWorkspaceGuard)
  createTag(@Body() createTagDto: CreateTagDto, @CurrentUser() user: any, @Req() req: any) {
    return this.tagsService.createTag(req.workspace.id, createTagDto, user.id);
  }

  @Get()
  @UseGuards(RequireWorkspaceGuard)
  getTags(@Req() req: any) {
    return this.tagsService.getTags(req.workspace.id);
  }

  @Get(':id')
  @UseGuards(RequireWorkspaceGuard)
  getTagById(@Param('id') id: string, @Req() req: any) {
    return this.tagsService.getTagById(req.workspace.id, id);
  }

  @Put(':id')
  @UseGuards(RequireWorkspaceGuard)
  updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto, @CurrentUser() user: any, @Req() req: any) {
    return this.tagsService.updateTag(req.workspace.id, id, updateTagDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RequireWorkspaceGuard)
  deleteTag(@Param('id') id: string, @Req() req: any) {
    return this.tagsService.deleteTag(req.workspace.id, id);
  }

  // Relacionamento com workflows
  @Post('workflows/:workflowId/assign')
  @UseGuards(RequireWorkspaceGuard)
  assignTagsToWorkflow(@Param('workflowId') workflowId: string, @Body() assignTagsDto: AssignTagsToWorkflowDto, @Req() req: any) {
    return this.tagsService.assignTagsToWorkflow(req.workspace.id, workflowId, assignTagsDto);
  }

  @Get('workflows/:workflowId')
  @UseGuards(RequireWorkspaceGuard)
  getWorkflowTags(@Param('workflowId') workflowId: string, @Req() req: any) {
    return this.tagsService.getWorkflowTags(req.workspace.id, workflowId);
  }

  @Get('categories/:categoryId/tags')
  @UseGuards(RequireWorkspaceGuard)
  getTagsByCategory(@Param('categoryId') categoryId: string, @Req() req: any) {
    return this.tagsService.getTagsByCategory(req.workspace.id, categoryId);
  }
}
