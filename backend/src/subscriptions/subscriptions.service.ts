import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async getPlans() {
    return {
      plans: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          currency: 'MXN',
          interval: 'lifetime',
          features: [
            'Track 1 product',
            'Email notifications',
            '30-day price history',
            'Basic price comparison',
          ],
          limits: {
            maxTrackedProducts: 1,
          },
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 9900, // 99.00 MXN in cents
          currency: 'MXN',
          interval: 'month',
          features: [
            'Unlimited product tracking',
            'Instant email + push notifications',
            'Complete price history',
            'Custom price alerts',
            'Advanced statistics',
            'Priority access to new features',
          ],
          limits: {
            maxTrackedProducts: -1, // unlimited
          },
        },
      ],
    };
  }

  async upgradeToPremium(userId: string) {
    // In a real app, this would integrate with Stripe/MercadoPago
    // For now, we'll just update the subscription

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        maxTrackedProducts: -1,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return {
      message: 'Successfully upgraded to Premium',
      subscription: updated,
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return {
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: updated,
    };
  }
}
