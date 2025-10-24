import { IsString, IsOptional, IsUUID, IsEnum, IsObject, IsBoolean, IsNotEmpty, MaxLength, IsArray, IsDateString, IsNumber } from 'class-validator';

export class ShareProjectDto {
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
  permissions?: {
    view?: boolean;
    edit?: boolean;
    fork?: boolean;
  };

  @IsOptional()
  @IsEnum(['public', 'private', 'restricted'])
  access_type?: string = 'public';

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsOptional()
  @IsNumber()
  max_views?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateSharedProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsObject()
  permissions?: {
    view?: boolean;
    edit?: boolean;
    fork?: boolean;
  };

  @IsOptional()
  @IsEnum(['public', 'private', 'restricted'])
  access_type?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsOptional()
  @IsNumber()
  max_views?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateProjectPermissionDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsObject()
  permissions?: {
    view?: boolean;
    edit?: boolean;
    fork?: boolean;
  };
}

export class UpdateProjectPermissionDto {
  @IsOptional()
  @IsObject()
  permissions?: {
    view?: boolean;
    edit?: boolean;
    fork?: boolean;
  };
}

export class CreateProjectCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsUUID()
  parent_comment_id?: string;
}

export class UpdateProjectCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}

export class GetSharedProjectsDto {
  @IsOptional()
  @IsEnum(['public', 'private', 'restricted'])
  access_type?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}

export class ForkProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
