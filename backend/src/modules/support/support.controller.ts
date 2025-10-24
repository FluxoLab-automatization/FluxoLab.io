import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto, UpdateTicketDto, CreateTicketMessageDto, UpdateTicketMessageDto, CreateTicketRatingDto, GetTicketsDto, CreateCategoryDto, UpdateCategoryDto, CreatePriorityDto, UpdatePriorityDto } from './dto/support.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('api/support')
@UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Tickets
  @Post('tickets')
  createTicket(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.createTicket(req.workspace.id, user.id, createTicketDto);
  }

  @Get('tickets')
  getTickets(@Query() query: GetTicketsDto, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.getTickets(req.workspace.id, user.id, query);
  }

  @Get('tickets/:id')
  getTicketById(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.getTicketById(req.workspace.id, user.id, id);
  }

  @Put('tickets/:id')
  updateTicket(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.updateTicket(req.workspace.id, user.id, id, updateTicketDto);
  }

  @Delete('tickets/:id')
  deleteTicket(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.deleteTicket(req.workspace.id, user.id, id);
  }

  // Mensagens dos tickets
  @Post('tickets/:id/messages')
  createTicketMessage(@Param('id') id: string, @Body() createMessageDto: CreateTicketMessageDto, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.createTicketMessage(req.workspace.id, user.id, id, createMessageDto);
  }

  @Get('tickets/:id/messages')
  getTicketMessages(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.getTicketMessages(req.workspace.id, user.id, id);
  }

  @Put('messages/:id')
  updateTicketMessage(@Param('id') id: string, @Body() updateMessageDto: UpdateTicketMessageDto, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.updateTicketMessage(req.workspace.id, user.id, id, updateMessageDto);
  }

  @Delete('messages/:id')
  deleteTicketMessage(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.deleteTicketMessage(req.workspace.id, user.id, id);
  }

  // Avaliações
  @Post('tickets/:id/ratings')
  createTicketRating(@Param('id') id: string, @Body() createRatingDto: CreateTicketRatingDto, @CurrentUser() user: any, @Req() req: any) {
    return this.supportService.createTicketRating(req.workspace.id, user.id, id, createRatingDto);
  }

  @Get('tickets/:id/ratings')
  getTicketRatings(@Param('id') id: string, @Req() req: any) {
    return this.supportService.getTicketRatings(req.workspace.id, id);
  }

  // Categorias
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.supportService.createCategory(createCategoryDto);
  }

  @Get('categories')
  getCategories() {
    return this.supportService.getCategories();
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.supportService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.supportService.deleteCategory(id);
  }

  // Prioridades
  @Post('priorities')
  createPriority(@Body() createPriorityDto: CreatePriorityDto) {
    return this.supportService.createPriority(createPriorityDto);
  }

  @Get('priorities')
  getPriorities() {
    return this.supportService.getPriorities();
  }

  @Put('priorities/:id')
  updatePriority(@Param('id') id: string, @Body() updatePriorityDto: UpdatePriorityDto) {
    return this.supportService.updatePriority(id, updatePriorityDto);
  }

  @Delete('priorities/:id')
  deletePriority(@Param('id') id: string) {
    return this.supportService.deletePriority(id);
  }

  // Status
  @Get('statuses')
  getStatuses() {
    return this.supportService.getStatuses();
  }
}
