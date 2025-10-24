"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_module_1 = require("../../shared/database/database.module");
const connectors_service_1 = require("./connectors.service");
const connectors_controller_1 = require("./connectors.controller");
const connections_service_1 = require("./connections.service");
const connections_controller_1 = require("./connections.controller");
const br_connectors_service_1 = require("./br-connectors.service");
const entities_1 = require("./entities");
let ConnectorsModule = class ConnectorsModule {
};
exports.ConnectorsModule = ConnectorsModule;
exports.ConnectorsModule = ConnectorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Connector,
                entities_1.ConnectorVersion,
                entities_1.ConnectorAction,
                entities_1.Connection,
                entities_1.ConnectionSecret,
                entities_1.OAuthToken,
            ]),
        ],
        providers: [
            connectors_service_1.ConnectorsService,
            connections_service_1.ConnectionsService,
            br_connectors_service_1.BrConnectorsService,
        ],
        controllers: [
            connectors_controller_1.ConnectorsController,
            connections_controller_1.ConnectionsController,
        ],
        exports: [
            connectors_service_1.ConnectorsService,
            connections_service_1.ConnectionsService,
            br_connectors_service_1.BrConnectorsService,
        ],
    })
], ConnectorsModule);
//# sourceMappingURL=connectors.module.js.map