import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // DASHBOARD
  // ============================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ============================================
  // STORES MANAGEMENT
  // ============================================

  @Get('stores')
  @ApiOperation({ summary: 'Get all stores (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of stores' })
  getAllStores() {
    return this.adminService.getAllStores();
  }

  @Get('stores/:id')
  @ApiOperation({ summary: 'Get store by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Store found' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  getStore(@Param('id') id: string) {
    return this.adminService.getStore(id);
  }

  @Post('stores')
  @ApiOperation({ summary: 'Create new store (Admin only)' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  @ApiResponse({ status: 409, description: 'Store already exists' })
  createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.adminService.createStore(createStoreDto);
  }

  @Put('stores/:id')
  @ApiOperation({ summary: 'Update store (Admin only)' })
  @ApiResponse({ status: 200, description: 'Store updated successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  updateStore(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.adminService.updateStore(id, updateStoreDto);
  }

  @Delete('stores/:id')
  @ApiOperation({ summary: 'Delete store (Admin only)' })
  @ApiResponse({ status: 200, description: 'Store deleted successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  deleteStore(@Param('id') id: string) {
    return this.adminService.deleteStore(id);
  }

  // ============================================
  // SYSTEM CONFIG MANAGEMENT
  // ============================================

  @Get('config')
  @ApiOperation({ summary: 'Get all system configurations (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of configurations' })
  getAllConfigs() {
    return this.adminService.getAllConfigs();
  }

  @Get('config/:key')
  @ApiOperation({ summary: 'Get configuration by key (Admin only)' })
  @ApiResponse({ status: 200, description: 'Configuration found' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  getConfig(@Param('key') key: string) {
    return this.adminService.getConfig(key);
  }

  @Post('config')
  @ApiOperation({ summary: 'Create new configuration (Admin only)' })
  @ApiResponse({ status: 201, description: 'Configuration created successfully' })
  @ApiResponse({ status: 409, description: 'Configuration already exists' })
  createConfig(@Body() createConfigDto: CreateSystemConfigDto) {
    return this.adminService.createConfig(createConfigDto);
  }

  @Put('config/:key')
  @ApiOperation({ summary: 'Update configuration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  updateConfig(@Param('key') key: string, @Body() updateConfigDto: UpdateSystemConfigDto) {
    return this.adminService.updateConfig(key, updateConfigDto);
  }

  @Delete('config/:key')
  @ApiOperation({ summary: 'Delete configuration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  deleteConfig(@Param('key') key: string) {
    return this.adminService.deleteConfig(key);
  }

  // ============================================
  // JOBS MANAGEMENT
  // ============================================

  @Get('jobs')
  @ApiOperation({ summary: 'Get all scraping jobs (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  getAllJobs(@Query('limit') limit?: number) {
    return this.adminService.getAllJobs(limit || 100);
  }

  @Get('jobs/stats')
  @ApiOperation({ summary: 'Get job statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Job stats' })
  getJobStats() {
    return this.adminService.getJobStats();
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  updateUserRole(@Param('id') id: string, @Body('role') role: 'USER' | 'ADMIN') {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
