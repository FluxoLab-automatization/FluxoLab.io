import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkspaceSettingsService, type WorkspaceSettingsSummary } from './workspace-settings.service';
export declare class SettingsController {
    private readonly workspaceSettingsService;
    constructor(workspaceSettingsService: WorkspaceSettingsService);
    getSettingsSummary(user: AuthenticatedUser): Promise<{
        status: 'ok';
        summary: WorkspaceSettingsSummary;
    }>;
}
