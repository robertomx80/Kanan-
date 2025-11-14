import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { NotificationType, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initializeMailer();
  }

  private initializeMailer() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });

    this.logger.log('✅ Email transporter initialized');
  }

  async sendPriceDropNotification(userId: string, productId: string, newPrice: number, oldPrice: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!user || !product) {
      return;
    }

    const priceDrop = oldPrice - newPrice;
    const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(2);

    const subject = `🔔 Price Drop Alert: ${product.name}`;
    const message = `
      <h2>Great News! The price dropped!</h2>
      <p><strong>${product.name}</strong></p>
      <p>Previous Price: $${oldPrice.toFixed(2)} MXN</p>
      <p>New Price: <strong>$${newPrice.toFixed(2)} MXN</strong></p>
      <p>You save: <strong>$${priceDrop.toFixed(2)} MXN (${percentageDrop}%)</strong></p>
      <p><a href="${this.configService.get('APP_URL')}/products/${productId}">View Product</a></p>
    `;

    await this.sendEmail(userId, subject, message, {
      productId,
      newPrice,
      oldPrice,
      priceDrop,
    });
  }

  async sendEmail(userId: string, subject: string, message: string, data?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.EMAIL,
        status: NotificationStatus.PENDING,
        subject,
        message,
        data,
      },
    });

    try {
      // Send email
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: user.email,
        subject,
        html: message,
      });

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      this.logger.log(`✅ Email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          failedAt: new Date(),
          errorMessage: error.message,
        },
      });
    }
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }
}
