import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '@prisma/client';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('current')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription' })
  getCurrentSubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getCurrentSubscription(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to Premium' })
  @ApiResponse({ status: 200, description: 'Successfully upgraded' })
  upgradeToPremium(@CurrentUser() user: User) {
    return this.subscriptionsService.upgradeToPremium(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled' })
  cancelSubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }
}
