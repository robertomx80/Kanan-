import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PricesModule } from './prices/prices.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ScrapingModule } from './scraping/scraping.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JobsModule } from './jobs/jobs.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Bull Queue
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),

    // Application modules
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    PricesModule,
    SubscriptionsModule,
    ScrapingModule,
    NotificationsModule,
    JobsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
