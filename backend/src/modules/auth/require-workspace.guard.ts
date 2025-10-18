import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from './auth.types';

interface WorkspaceRequest extends Request {
  user?: AuthenticatedUser;
  workspaceId?: string;
}

@Injectable()
export class RequireWorkspaceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const user = request.user;

    if (!user || !user.workspaceId) {
      throw new UnprocessableEntityException({
        status: 'error',
        message: 'Workspace padrao nao definido. Crie ou selecione um workspace e tente novamente.',
      });
    }

    request.workspaceId = user.workspaceId;
    return true;
  }
}

