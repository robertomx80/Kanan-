import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TrackProductDto } from './dto/track-product.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class PricesService {
  constructor(private prisma: PrismaService) {}

  // Product Tracking
  async trackProduct(userId: string, trackProductDto: TrackProductDto) {
    const { productId } = trackProductDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check subscription limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const trackingCount = await this.prisma.productTracking.count({
      where: { userId },
    });

    const maxAllowed = user.subscription.maxTrackedProducts;

    if (maxAllowed !== -1 && trackingCount >= maxAllowed) {
      throw new ForbiddenException(
        `Tracking limit reached. Your ${user.subscription.plan} plan allows ${maxAllowed} product(s). Upgrade to Premium for unlimited tracking.`,
      );
    }

    // Check if already tracking
    const existing = await this.prisma.productTracking.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      return {
        message: 'Product is already being tracked',
        tracking: existing,
      };
    }

    // Get current price as initial price
    const latestPrice = await this.prisma.price.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    // Create tracking
    const tracking = await this.prisma.productTracking.create({
      data: {
        userId,
        productId,
        initialPrice: latestPrice?.price,
        lowestPrice: latestPrice?.price,
        highestPrice: latestPrice?.price,
      },
      include: {
        product: true,
      },
    });

    return tracking;
  }

  async untrackProduct(userId: string, trackingId: string) {
    const tracking = await this.prisma.productTracking.findUnique({
      where: { id: trackingId },
    });

    if (!tracking) {
      throw new NotFoundException('Tracking not found');
    }

    if (tracking.userId !== userId) {
      throw new ForbiddenException('You can only untrack your own products');
    }

    await this.prisma.productTracking.delete({
      where: { id: trackingId },
    });

    return { message: 'Product untracked successfully' };
  }

  async getMyTrackedProducts(userId: string) {
    const trackings = await this.prisma.productTracking.findMany({
      where: { userId, isActive: true },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with current prices
    const enriched = await Promise.all(
      trackings.map(async (tracking) => {
        const currentPrices = await this.getCurrentPrices(tracking.productId);
        const lowestCurrentPrice =
          currentPrices.length > 0 ? Math.min(...currentPrices.map((p) => p.price)) : null;

        return {
          ...tracking,
          currentPrices,
          lowestCurrentPrice,
          priceChange: tracking.initialPrice
            ? ((lowestCurrentPrice - tracking.initialPrice) / tracking.initialPrice) * 100
            : null,
        };
      }),
    );

    return enriched;
  }

  // Price Alerts
  async createAlert(userId: string, createAlertDto: CreateAlertDto) {
    const { productId, condition, targetPrice, percentage } = createAlertDto;

    // Validate
    if (
      (condition === 'DROPS_BELOW' || condition === 'RISES_ABOVE') &&
      targetPrice === undefined
    ) {
      throw new BadRequestException('targetPrice is required for this condition');
    }

    if (condition === 'PERCENTAGE_DROP' && percentage === undefined) {
      throw new BadRequestException('percentage is required for this condition');
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Create alert
    const alert = await this.prisma.priceAlert.create({
      data: {
        userId,
        productId,
        condition,
        targetPrice,
        percentage,
      },
      include: {
        product: true,
      },
    });

    return alert;
  }

  async getMyAlerts(userId: string) {
    return this.prisma.priceAlert.findMany({
      where: { userId, isActive: true },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAlert(userId: string, alertId: string) {
    const alert = await this.prisma.priceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    if (alert.userId !== userId) {
      throw new ForbiddenException('You can only delete your own alerts');
    }

    await this.prisma.priceAlert.delete({
      where: { id: alertId },
    });

    return { message: 'Alert deleted successfully' };
  }

  // Helper methods
  private async getCurrentPrices(productId: string) {
    const stores = await this.prisma.store.findMany({
      where: { isActive: true },
    });

    const pricesPromises = stores.map(async (store) => {
      const latestPrice = await this.prisma.price.findFirst({
        where: {
          productId,
          storeId: store.id,
          isAvailable: true,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          store: true,
        },
      });

      return latestPrice;
    });

    const prices = await Promise.all(pricesPromises);
    return prices.filter((p) => p !== null);
  }
}
