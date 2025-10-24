import { IsString, IsUUID, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class StartWorkflowDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsObject()
  @IsNotEmpty()
  triggerData: Record<string, any>;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  @IsString()
  traceId?: string;
}

export class ProcessNodeDto {
  @IsUUID()
  runId: string;

  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsObject()
  @IsNotEmpty()
  nodeData: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  inputData: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  context: Record<string, any>;
}

export class CreateHumanTaskDto {
  @IsUUID()
  runId: string;

  @IsString()
  @IsNotEmpty()
  stepId: string;

  @IsString()
  @IsNotEmpty()
  taskType: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  assignedToEmail?: string;

  @IsOptional()
  @IsString()
  assignedToName?: string;

  @IsOptional()
  slaHours?: number;

  @IsOptional()
  @IsObject()
  inputData?: Record<string, any>;
}

export class ProcessHumanTaskDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsObject()
  outputData?: Record<string, any>;
}
