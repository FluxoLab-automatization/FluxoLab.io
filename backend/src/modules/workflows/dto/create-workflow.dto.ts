import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkflowNodePositionDto {
  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;
}

class WorkflowNodePortDto {
  @IsString()
  id!: string;

  @IsIn(['input', 'output'])
  kind!: 'input' | 'output';

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsIn(['left', 'right', 'top', 'bottom'])
  alignment?: 'left' | 'right' | 'top' | 'bottom';
}

class WorkflowNodeStyleDto {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  accent?: string;

  @IsOptional()
  @IsIn(['default', 'success', 'warning', 'info'])
  variant?: 'default' | 'success' | 'warning' | 'info';

  @IsOptional()
  @IsIn(['ready', 'inactive', 'error'])
  status?: 'ready' | 'inactive' | 'error';
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowNodePositionDto)
  position?: WorkflowNodePositionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodePortDto)
  ports?: WorkflowNodePortDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowNodeStyleDto)
  style?: WorkflowNodeStyleDto;
}

class WorkflowConnectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsOptional()
  @IsString()
  output?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsIn(['solid', 'dashed'])
  variant?: 'solid' | 'dashed';

  @IsOptional()
  @IsString()
  fromPort?: string;

  @IsOptional()
  @IsString()
  toPort?: string;
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
