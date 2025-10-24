import { IsString, IsOptional, IsUUID, IsArray, IsNotEmpty, MaxLength, IsHexColor } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string = '#6366f1';

  @IsOptional()
  @IsUUID()
  category_id?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;
}

export class CreateTagCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string = '#6366f1';
}

export class UpdateTagCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class AssignTagsToWorkflowDto {
  @IsArray()
  @IsUUID('4', { each: true })
  tag_ids: string[];
}
