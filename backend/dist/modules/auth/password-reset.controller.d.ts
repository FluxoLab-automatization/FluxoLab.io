import { Request } from 'express';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto, VerifyResetCodeDto, ResetPasswordDto, PasswordResetResponseDto, VerifyCodeResponseDto } from './dto/password-reset.dto';
export declare class PasswordResetController {
    private readonly passwordResetService;
    constructor(passwordResetService: PasswordResetService);
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, req: Request): Promise<PasswordResetResponseDto>;
    verifyCode(verifyCodeDto: VerifyResetCodeDto): Promise<VerifyCodeResponseDto>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<PasswordResetResponseDto>;
}
