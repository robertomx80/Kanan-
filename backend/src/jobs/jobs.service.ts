import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { ScrapingService } from '../scraping/scraping.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private scrapingService: ScrapingService,
    private notificationsService: NotificationsService,
    @InjectQueue('price-updates') private priceQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async handlePriceUpdates() {
    this.logger.log('🔄 Starting scheduled price update job...');

    try {
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      });

      for (const product of products) {
        await this.priceQueue.add('scrape-product', {
          productId: product.id,
        });
      }

      this.logger.log(`✅ Queued ${products.length} products for price update`);
    } catch (error) {
      this.logger.error(`❌ Error in price update job: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkPriceAlerts() {
    this.logger.log('🔔 Checking price alerts...');

    try {
      const activeAlerts = await this.prisma.priceAlert.findMany({
        where: { isActive: true },
        include: {
          user: true,
          product: true,
        },
      });

      for (const alert of activeAlerts) {
        // Get latest price
        const latestPrice = await this.prisma.price.findFirst({
          where: { productId: alert.productId },
          orderBy: { createdAt: 'desc' },
        });

        if (!latestPrice) continue;

        let shouldTrigger = false;

        switch (alert.condition) {
          case 'DROPS_BELOW':
            shouldTrigger = latestPrice.price < alert.targetPrice;
            break;
          case 'RISES_ABOVE':
            shouldTrigger = latestPrice.price > alert.targetPrice;
            break;
          case 'ANY_CHANGE':
            shouldTrigger = true;
            break;
        }

        if (shouldTrigger && !alert.triggeredAt) {
          // Send notification
          await this.notificationQueue.add('price-alert', {
            userId: alert.userId,
            productId: alert.productId,
            price: latestPrice.price,
            alertId: alert.id,
          });

          // Mark as triggered
          await this.prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              triggeredAt: new Date(),
              lastCheckedAt: new Date(),
            },
          });

          this.logger.log(`🔔 Alert triggered for user ${alert.userId}`);
        } else {
          // Update last checked
          await this.prisma.priceAlert.update({
            where: { id: alert.id },
            data: { lastCheckedAt: new Date() },
          });
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error checking price alerts: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldData() {
    this.logger.log('🧹 Cleaning up old data...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Keep only last 30 days of prices for free users
      // Premium users keep all history

      const freeUsers = await this.prisma.user.findMany({
        where: {
          subscription: {
            plan: 'FREE',
          },
        },
        select: { id: true },
      });

      for (const user of freeUsers) {
        const trackings = await this.prisma.productTracking.findMany({
          where: { userId: user.id },
          select: { productId: true },
        });

        for (const tracking of trackings) {
          await this.prisma.price.deleteMany({
            where: {
              productId: tracking.productId,
              createdAt: { lt: thirtyDaysAgo },
            },
          });
        }
      }

      this.logger.log('✅ Cleanup completed');
    } catch (error) {
      this.logger.error(`❌ Error in cleanup job: ${error.message}`);
    }
  }
}
