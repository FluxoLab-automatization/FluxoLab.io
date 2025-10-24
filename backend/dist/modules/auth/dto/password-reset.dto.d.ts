export declare class ForgotPasswordDto {
    identifier: string;
}
export declare class VerifyResetCodeDto {
    identifier: string;
    code: string;
}
export declare class ResetPasswordDto {
    resetToken: string;
    newPassword: string;
}
export declare class PasswordResetResponseDto {
    message: string;
}
export declare class VerifyCodeResponseDto {
    resetToken: string;
}
