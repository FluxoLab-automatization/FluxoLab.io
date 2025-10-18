import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsNotEmpty()
  secret!: Record<string, unknown>;
}

