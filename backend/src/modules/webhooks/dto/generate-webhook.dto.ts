import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GenerateWebhookDto {
  @IsUUID()
  workspaceId!: string;

  @IsUUID()
  workflowId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  path?: string;

  @IsOptional()
  @IsIn(['GET', 'POST'])
  method?: 'GET' | 'POST';

  @IsOptional()
  @IsIn(['immediate', 'on_last_node', 'via_node'])
  respondMode?: 'immediate' | 'on_last_node' | 'via_node';

  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;
}
