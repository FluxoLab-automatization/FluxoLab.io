import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  const conversationsRepository = {
    listRecentByOwner: jest.fn(),
    createProject: jest.fn(),
  };
  const activitiesRepository = {} as any;
  const webhookRepository = {} as any;
  const usageRepository = {
    getLatestSnapshot: jest.fn(),
  };

  const service = new WorkspaceService(
    conversationsRepository as any,
    activitiesRepository,
    webhookRepository,
    usageRepository as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates projects with normalized metadata', async () => {
    const now = new Date();
    (conversationsRepository.createProject as jest.Mock).mockResolvedValue({
      id: 'project-1',
      owner_id: 'user-1',
      title: 'New Project',
      status: 'active',
      metadata: { description: 'Descrição', tags: ['manual'] },
      created_at: now,
      updated_at: now,
    });

    const user = {
      id: 'user-1',
      workspaceId: 'workspace-1',
    } as AuthenticatedUser;

    const result = await service.createProject(user, {
      title: 'New Project',
      description: 'Descrição',
      tags: ['manual'],
    });

    expect(conversationsRepository.createProject).toHaveBeenCalledWith({
      ownerId: 'user-1',
      title: 'New Project',
      status: 'active',
      metadata: {
        description: 'Descrição',
        tags: ['manual'],
      },
    });

    expect(result).toEqual({
      id: 'project-1',
      title: 'New Project',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      metadata: {
        description: 'Descrição',
        tags: ['manual'],
      },
    });
  });
});
