import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkflowNodeDto {
  @IsString()
  id!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  params?: Record<string, unknown>;
}

class WorkflowConnectionDto {
  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsOptional()
  @IsString()
  output?: string;
}

export class WorkflowDefinitionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeDto)
  nodes!: WorkflowNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConnectionDto)
  connections!: WorkflowConnectionDto[];
}

export class CreateWorkflowDto {
  @IsString()
  name!: string;

  @ValidateNested()
  @Type(() => WorkflowDefinitionDto)
  definition!: WorkflowDefinitionDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
