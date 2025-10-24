import { Module } from '@nestjs/common';
import { ProjectSharingController } from './project-sharing.controller';
import { ProjectSharingService } from './project-sharing.service';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectSharingController],
  providers: [ProjectSharingService],
  exports: [ProjectSharingService],
})
export class ProjectSharingModule {}
