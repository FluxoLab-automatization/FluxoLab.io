import { IsString, IsOptional, IsUUID, IsEnum, IsObject, IsNumber, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsEnum(['workflow', 'general', 'troubleshooting', 'learning'])
  context_type?: string = 'workflow';

  @IsOptional()
  @IsObject()
  context_data?: Record<string, any>;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateWorkflowSuggestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsObject()
  workflow_definition?: Record<string, any>;

  @IsOptional()
  @IsEnum(['workflow', 'node', 'optimization', 'fix'])
  suggestion_type?: string = 'workflow';

  @IsOptional()
  @IsNumber()
  confidence_score?: number;
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(['active', 'archived', 'deleted'])
  status?: string;
}

export class GetConversationsDto {
  @IsOptional()
  @IsEnum(['workflow', 'general', 'troubleshooting', 'learning'])
  context_type?: string;

  @IsOptional()
  @IsEnum(['active', 'archived', 'deleted'])
  status?: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}
