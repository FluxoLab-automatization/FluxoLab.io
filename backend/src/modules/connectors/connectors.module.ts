import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { BrConnectorsService } from './br-connectors.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ConnectorsService,
    ConnectionsService,
    BrConnectorsService,
  ],
  controllers: [
    ConnectorsController,
    ConnectionsController,
  ],
  exports: [
    ConnectorsService,
    ConnectionsService,
    BrConnectorsService,
  ],
})
export class ConnectorsModule {}
