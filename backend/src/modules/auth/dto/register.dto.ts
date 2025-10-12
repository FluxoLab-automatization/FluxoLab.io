import {
  IsHexColor,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(190)
  displayName!: string;

  @IsOptional()
  @IsHexColor()
  avatarColor?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  accessToken?: string;
}
