import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import {
  Template,
  TemplateVersion,
  TemplateParam,
  TemplateReview,
} from './entities';
import { TemplateInstallsService } from './template-installs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Template, TemplateVersion, TemplateParam, TemplateReview]),
  ],
  providers: [TemplatesService, TemplateInstallsService],
  exports: [TemplatesService, TemplateInstallsService],
})
export class TemplatesModule {}