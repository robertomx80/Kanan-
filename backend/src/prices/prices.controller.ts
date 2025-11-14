import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PricesService } from './prices.service';
import { TrackProductDto } from './dto/track-product.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('tracking')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  // Product Tracking
  @Post()
  @ApiOperation({ summary: 'Start tracking a product' })
  @ApiResponse({ status: 201, description: 'Product tracked successfully' })
  @ApiResponse({ status: 403, description: 'Tracking limit reached' })
  trackProduct(@CurrentUser() user: User, @Body() trackProductDto: TrackProductDto) {
    return this.pricesService.trackProduct(user.id, trackProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my tracked products' })
  @ApiResponse({ status: 200, description: 'List of tracked products' })
  getMyTrackedProducts(@CurrentUser() user: User) {
    return this.pricesService.getMyTrackedProducts(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Stop tracking a product' })
  @ApiResponse({ status: 200, description: 'Product untracked successfully' })
  @ApiResponse({ status: 404, description: 'Tracking not found' })
  untrackProduct(@CurrentUser() user: User, @Param('id') id: string) {
    return this.pricesService.untrackProduct(user.id, id);
  }

  // Price Alerts
  @Post('alerts')
  @ApiOperation({ summary: 'Create a price alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  createAlert(@CurrentUser() user: User, @Body() createAlertDto: CreateAlertDto) {
    return this.pricesService.createAlert(user.id, createAlertDto);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get my price alerts' })
  @ApiResponse({ status: 200, description: 'List of price alerts' })
  getMyAlerts(@CurrentUser() user: User) {
    return this.pricesService.getMyAlerts(user.id);
  }

  @Delete('alerts/:id')
  @ApiOperation({ summary: 'Delete a price alert' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  deleteAlert(@CurrentUser() user: User, @Param('id') id: string) {
    return this.pricesService.deleteAlert(user.id, id);
  }
}
