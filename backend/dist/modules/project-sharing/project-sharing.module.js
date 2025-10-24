"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSharingModule = void 0;
const common_1 = require("@nestjs/common");
const project_sharing_controller_1 = require("./project-sharing.controller");
const project_sharing_service_1 = require("./project-sharing.service");
const database_module_1 = require("../../shared/database/database.module");
let ProjectSharingModule = class ProjectSharingModule {
};
exports.ProjectSharingModule = ProjectSharingModule;
exports.ProjectSharingModule = ProjectSharingModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [project_sharing_controller_1.ProjectSharingController],
        providers: [project_sharing_service_1.ProjectSharingService],
        exports: [project_sharing_service_1.ProjectSharingService],
    })
], ProjectSharingModule);
//# sourceMappingURL=project-sharing.module.js.map