import { Controller, Post, Body, HttpCode, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { PasswordResetService } from './password-reset.service';
import { 
  ForgotPasswordDto, 
  VerifyResetCodeDto, 
  ResetPasswordDto,
  PasswordResetResponseDto,
  VerifyCodeResponseDto
} from './dto/password-reset.dto';

@Controller('auth/password')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request
  ): Promise<PasswordResetResponseDto> {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await this.passwordResetService.requestPasswordReset(
      forgotPasswordDto.identifier,
      ipAddress,
      userAgent
    );

    // Sempre retornar a mesma mensagem para evitar enumeração de usuários
    return {
      message: 'Se existir uma conta com este email ou CPF, enviamos um código de verificação.'
    };
  }

  @Post('verify')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async verifyCode(
    @Body() verifyCodeDto: VerifyResetCodeDto
  ): Promise<VerifyCodeResponseDto> {
    const resetToken = await this.passwordResetService.verifyResetCode(
      verifyCodeDto.identifier,
      verifyCodeDto.code
    );

    return { resetToken };
  }

  @Post('reset')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<PasswordResetResponseDto> {
    await this.passwordResetService.resetPassword(
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword
    );

    return {
      message: 'Senha alterada com sucesso. Faça login com sua nova senha.'
    };
  }
}
