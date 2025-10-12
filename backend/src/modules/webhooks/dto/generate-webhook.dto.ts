import { IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateWebhookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(190)
  userId!: string;
}
