import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RequireWorkspaceGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
