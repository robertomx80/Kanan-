import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { PriceUpdatesProcessor } from './processors/price-updates.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { ScrapingModule } from '../scraping/scraping.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'price-updates' },
      { name: 'notifications' },
    ),
    ScrapingModule,
    NotificationsModule,
  ],
  providers: [JobsService, PriceUpdatesProcessor, NotificationsProcessor],
  exports: [JobsService],
})
export class JobsModule {}
