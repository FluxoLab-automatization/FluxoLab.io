import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflows',
    }),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
