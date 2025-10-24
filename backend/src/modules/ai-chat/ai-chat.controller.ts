import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { CreateConversationDto, SendMessageDto, CreateWorkflowSuggestionDto, UpdateConversationDto, GetConversationsDto } from './dto/ai-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/ai-chat')
@UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  // Conversas
  @Post('conversations')
  createConversation(@Body() createConversationDto: CreateConversationDto, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.createConversation(req.workspace.id, user.id, createConversationDto);
  }

  @Get('conversations')
  getConversations(@Query() query: GetConversationsDto, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.getConversations(req.workspace.id, user.id, query);
  }

  @Get('conversations/:id')
  getConversationById(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.getConversationById(req.workspace.id, user.id, id);
  }

  @Put('conversations/:id')
  updateConversation(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.updateConversation(req.workspace.id, user.id, id, updateConversationDto);
  }

  @Delete('conversations/:id')
  deleteConversation(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.deleteConversation(req.workspace.id, user.id, id);
  }

  // Mensagens
  @Post('conversations/:id/messages')
  sendMessage(@Param('id') id: string, @Body() sendMessageDto: SendMessageDto, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.sendMessage(req.workspace.id, user.id, id, sendMessageDto);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.getMessages(req.workspace.id, user.id, id);
  }

  // Sugestões de workflow
  @Post('conversations/:id/suggestions')
  createWorkflowSuggestion(@Param('id') id: string, @Body() createSuggestionDto: CreateWorkflowSuggestionDto, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.createWorkflowSuggestion(req.workspace.id, user.id, id, createSuggestionDto);
  }

  @Get('suggestions')
  getWorkflowSuggestions(@Query('conversation_id') conversationId: string, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.getWorkflowSuggestions(req.workspace.id, user.id, conversationId);
  }

  @Put('suggestions/:id/status')
  updateWorkflowSuggestionStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser() user: any, @Req() req: any) {
    return this.aiChatService.updateWorkflowSuggestionStatus(req.workspace.id, user.id, id, status);
  }

  // Configurações de IA
  @Get('settings')
  getWorkspaceAISettings(@Req() req: any) {
    return this.aiChatService.getWorkspaceAISettings(req.workspace.id);
  }

  @Put('settings')
  updateWorkspaceAISettings(@Body() settings: any, @Req() req: any) {
    return this.aiChatService.updateWorkspaceAISettings(req.workspace.id, settings);
  }
}
