import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplateInstallsService } from './template-installs.service';
import { TemplateInstallsController } from './template-installs.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    TemplatesService,
    TemplateInstallsService,
  ],
  controllers: [
    TemplatesController,
    TemplateInstallsController,
  ],
  exports: [
    TemplatesService,
    TemplateInstallsService,
  ],
})
export class TemplatesModule {}
