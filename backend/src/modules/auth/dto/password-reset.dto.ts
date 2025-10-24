import { IsString, Length, Matches, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @Length(3, 150)
  identifier: string; // email ou CPF
}

export class VerifyResetCodeDto {
  @IsString()
  @Length(3, 150)
  identifier: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Código deve ter exatamente 6 dígitos' })
  code: string;
}

export class ResetPasswordDto {
  @IsString()
  resetToken: string;

  @IsString()
  @Length(8, 72, { message: 'Senha deve ter entre 8 e 72 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
  })
  newPassword: string;
}

export class PasswordResetResponseDto {
  message: string;
}

export class VerifyCodeResponseDto {
  resetToken: string;
}
