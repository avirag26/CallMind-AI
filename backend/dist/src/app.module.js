"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const patients_module_1 = require("./modules/patients/patients.module");
const calls_module_1 = require("./modules/calls/calls.module");
const ai_module_1 = require("./modules/ai/ai.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const health_module_1 = require("./modules/health/health.module");
const common_module_1 = require("./modules/common/common.module");
const config_module_1 = require("./modules/config/config.module");
const database_module_1 = require("./modules/database/database.module");
const queue_module_1 = require("./modules/queue/queue.module");
const events_module_1 = require("./modules/events/events.module");
const voice_module_1 = require("./modules/voice/voice.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, users_module_1.UsersModule, organizations_module_1.OrganizationsModule, doctors_module_1.DoctorsModule, patients_module_1.PatientsModule, calls_module_1.CallsModule, ai_module_1.AiModule, notifications_module_1.NotificationsModule, dashboard_module_1.DashboardModule, health_module_1.HealthModule, common_module_1.CommonModule, config_module_1.ConfigModule, database_module_1.DatabaseModule, queue_module_1.QueueModule, events_module_1.EventsModule, voice_module_1.VoiceModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map