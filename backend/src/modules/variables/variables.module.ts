import { Module } from '@nestjs/common';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VariablesController],
  providers: [VariablesService],
  exports: [VariablesService],
})
export class VariablesModule {}
