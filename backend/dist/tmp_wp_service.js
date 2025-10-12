"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceProvisioningService = void 0;
const common_1 = require("@nestjs/common");
const plans_repository_1 = require("../billing/repositories/plans.repository");
const subscriptions_repository_1 = require("../billing/repositories/subscriptions.repository");
const workspaces_repository_1 = require("./repositories/workspaces.repository");
const workspace_members_repository_1 = require("./repositories/workspace-members.repository");
const workspace_settings_repository_1 = require("./repositories/workspace-settings.repository");
const profiles_repository_1 = require("../auth/profiles.repository");
let WorkspaceProvisioningService = class WorkspaceProvisioningService {
    plansRepository;
    subscriptionsRepository;
    workspacesRepository;
    membersRepository;
    settingsRepository;
    profilesRepository;
    constructor(plansRepository, subscriptionsRepository, workspacesRepository, membersRepository, settingsRepository, profilesRepository) {
        this.plansRepository = plansRepository;
        this.subscriptionsRepository = subscriptionsRepository;
        this.workspacesRepository = workspacesRepository;
        this.membersRepository = membersRepository;
        this.settingsRepository = settingsRepository;
        this.profilesRepository = profilesRepository;
    }
    async provisionInitialWorkspace(params) {
        const planCode = params.planCode ?? 'free';
        const plan = await this.plansRepository.findByCode(planCode);
        if (!plan || !plan.isActive) {
            throw new common_1.NotFoundException(`Plano ${planCode} nao encontrado ou inativo`);
        }
        const workspaceName = params.workspaceName?.trim() || 'Workspace FluxoLab';
        const slug = await this.workspacesRepository.generateUniqueSlug(workspaceName);
        const workspace = await this.workspacesRepository.createWorkspace({
            ownerId: params.userId,
            planId: plan.id,
            name: workspaceName,
            slug,
            timezone: params.timezone,
            region: params.region ?? 'br-sao',
            settings: {
                planCode,
                provisionedAt: new Date().toISOString(),
            },
        });
        await this.settingsRepository.ensureDefaults(workspace.id);
        const adminProfileId = await this.profilesRepository.getRequiredProfileId('admin');
        await this.membersRepository.addOrActivateMember({
            workspaceId: workspace.id,
            userId: params.userId,
            profileId: adminProfileId,
            invitedBy: params.assignedBy ?? null,
        });
        const subscription = await this.subscriptionsRepository.createInitialSubscription({
            workspaceId: workspace.id,
            planId: plan.id,
            trialDays: plan.trialDays,
            metadata: {
                planCode: plan.code,
            },
        });
        return { workspace, subscription, plan };
    }
};
exports.WorkspaceProvisioningService = WorkspaceProvisioningService;
exports.WorkspaceProvisioningService = WorkspaceProvisioningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof plans_repository_1.PlansRepository !== "undefined" && plans_repository_1.PlansRepository) === "function" ? _a : Object, typeof (_b = typeof subscriptions_repository_1.SubscriptionsRepository !== "undefined" && subscriptions_repository_1.SubscriptionsRepository) === "function" ? _b : Object, typeof (_c = typeof workspaces_repository_1.WorkspacesRepository !== "undefined" && workspaces_repository_1.WorkspacesRepository) === "function" ? _c : Object, typeof (_d = typeof workspace_members_repository_1.WorkspaceMembersRepository !== "undefined" && workspace_members_repository_1.WorkspaceMembersRepository) === "function" ? _d : Object, typeof (_e = typeof workspace_settings_repository_1.WorkspaceSettingsRepository !== "undefined" && workspace_settings_repository_1.WorkspaceSettingsRepository) === "function" ? _e : Object, typeof (_f = typeof profiles_repository_1.ProfilesRepository !== "undefined" && profiles_repository_1.ProfilesRepository) === "function" ? _f : Object])
], WorkspaceProvisioningService);
//# sourceMappingURL=tmp_wp_service.js.map