import { Module } from '@nestjs/common';
import { PlansRepository } from './repositories/plans.repository';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';

@Module({
  providers: [PlansRepository, SubscriptionsRepository],
  exports: [PlansRepository, SubscriptionsRepository],
})
export class BillingModule {}
