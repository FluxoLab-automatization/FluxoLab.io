import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
import { 
  Execution, 
  ExecutionStep, 
  Workflow, 
  WorkflowVersion
} from '../entities';
import { 
  SystemEvent, 
  IdempotencyKey, 
  DistributedLock, 
  RetryQueue,
  CircuitBreaker,
  CompensationAction,
  ExecutionWindow,
  ScheduleJob,
  ExecutionMetric,
  Alert,
  AlertNotification,
  AlertHistory
} from '../../modules/engine/entities';
import {
  Connector,
  ConnectorVersion,
  ConnectorAction,
  Connection,
  ConnectionSecret,
  OAuthToken
} from '../../modules/connectors/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL', { infer: true }),
        entities: [
          // Entidades principais
          Execution,
          ExecutionStep,
          Workflow,
          WorkflowVersion,
          // Entidades do engine
          SystemEvent,
          IdempotencyKey,
          DistributedLock,
          RetryQueue,
          CircuitBreaker,
          CompensationAction,
          ExecutionWindow,
          ScheduleJob,
          ExecutionMetric,
          Alert,
          AlertNotification,
          AlertHistory,
          // Entidades dos conectores
          Connector,
          ConnectorVersion,
          ConnectorAction,
          Connection,
          ConnectionSecret,
          OAuthToken,
        ],
        synchronize: config.get('NODE_ENV', { infer: true }) === 'development',
        logging: config.get('NODE_ENV', { infer: true }) === 'development',
        ssl: config.get('PG_SSL', { infer: true }) ? { rejectUnauthorized: false } : false,
      }),
    }),
  ],
})
export class TypeOrmConfigModule {}
