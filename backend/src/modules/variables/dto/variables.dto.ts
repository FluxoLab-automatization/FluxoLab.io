import { IsString, IsOptional, IsBoolean, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateVariableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'json', 'secret'])
  type?: string = 'string';

  @IsOptional()
  @IsBoolean()
  is_encrypted?: boolean = false;
}

export class UpdateVariableDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'json', 'secret'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  is_encrypted?: boolean;
}

export class CreateWorkspaceVariableDto extends CreateVariableDto {}

export class UpdateWorkspaceVariableDto extends UpdateVariableDto {}
