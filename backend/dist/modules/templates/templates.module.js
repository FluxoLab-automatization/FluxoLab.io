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
const typeorm_1 = require("@nestjs/typeorm");
const templates_service_1 = require("./templates.service");
const entities_1 = require("./entities");
const template_installs_service_1 = require("./template-installs.service");
let TemplatesModule = class TemplatesModule {
};
exports.TemplatesModule = TemplatesModule;
exports.TemplatesModule = TemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.Template, entities_1.TemplateVersion, entities_1.TemplateParam, entities_1.TemplateReview]),
        ],
        providers: [templates_service_1.TemplatesService, template_installs_service_1.TemplateInstallsService],
        exports: [templates_service_1.TemplatesService, template_installs_service_1.TemplateInstallsService],
    })
], TemplatesModule);
//# sourceMappingURL=templates.module.js.map