"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../shared/database/database.module");
const templates_service_1 = require("./templates.service");
const templates_controller_1 = require("./templates.controller");
const template_installs_service_1 = require("./template-installs.service");
const template_installs_controller_1 = require("./template-installs.controller");
let TemplatesModule = class TemplatesModule {
};
exports.TemplatesModule = TemplatesModule;
exports.TemplatesModule = TemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        providers: [
            templates_service_1.TemplatesService,
            template_installs_service_1.TemplateInstallsService,
        ],
        controllers: [
            templates_controller_1.TemplatesController,
            template_installs_controller_1.TemplateInstallsController,
        ],
        exports: [
            templates_service_1.TemplatesService,
            template_installs_service_1.TemplateInstallsService,
        ],
    })
], TemplatesModule);
//# sourceMappingURL=templates.module.js.map