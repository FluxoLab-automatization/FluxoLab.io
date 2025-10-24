import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from '../../shared/database/database.module';
import { EngineService } from './engine.service';
import { EngineController } from './engine.controller';
import { EventProcessor } from './processors/event.processor';
import { WorkflowProcessor } from './processors/workflow.processor';
import { HumanTaskProcessor } from './processors/human-task.processor';
import { EvidenceProcessor } from './processors/evidence.processor';
import { UsageProcessor } from './processors/usage.processor';
import { AuditProcessor } from './processors/audit.processor';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue(
      { name: 'events' },
      { name: 'workflows' },
      { name: 'human-tasks' },
      { name: 'evidence' },
      { name: 'usage' },
      { name: 'audit' }
    ),
  ],
  providers: [
    EngineService,
    EventProcessor,
    WorkflowProcessor,
    HumanTaskProcessor,
    EvidenceProcessor,
    UsageProcessor,
    AuditProcessor,
  ],
  controllers: [EngineController],
  exports: [EngineService],
})
export class EngineModule {}
