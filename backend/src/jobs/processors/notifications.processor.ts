import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Process('price-alert')
  async handlePriceAlert(job: Job) {
    const { userId, productId, price, alertId } = job.data;

    this.logger.log(`Processing price alert for user: ${userId}`);

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      const tracking = await this.prisma.productTracking.findFirst({
        where: { userId, productId },
      });

      const oldPrice = tracking?.initialPrice || price;

      await this.notificationsService.sendPriceDropNotification(
        userId,
        productId,
        price,
        oldPrice,
      );

      this.logger.log(`✅ Sent price alert notification to user: ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send price alert: ${error.message}`);
      throw error;
    }
  }
}
