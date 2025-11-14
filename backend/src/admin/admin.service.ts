import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // STORES MANAGEMENT
  // ============================================

  async getAllStores() {
    return this.prisma.store.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { prices: true },
        },
      },
    });
  }

  async getStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        _count: {
          select: { prices: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async createStore(createStoreDto: CreateStoreDto) {
    // Check if store with same name or slug exists
    const existing = await this.prisma.store.findFirst({
      where: {
        OR: [
          { name: createStoreDto.name },
          { slug: createStoreDto.slug },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Store with same name or slug already exists');
    }

    return this.prisma.store.create({
      data: createStoreDto,
    });
  }

  async updateStore(id: string, updateStoreDto: UpdateStoreDto) {
    // Check if store exists
    await this.getStore(id);

    // If updating name or slug, check for conflicts
    if (updateStoreDto.name || updateStoreDto.slug) {
      const existing = await this.prisma.store.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { name: updateStoreDto.name },
                { slug: updateStoreDto.slug },
              ],
            },
          ],
        },
      });

      if (existing) {
        throw new ConflictException('Store with same name or slug already exists');
      }
    }

    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });
  }

  async deleteStore(id: string) {
    // Check if store exists
    await this.getStore(id);

    return this.prisma.store.delete({
      where: { id },
    });
  }

  // ============================================
  // SYSTEM CONFIG MANAGEMENT
  // ============================================

  async getAllConfigs() {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`Config with key ${key} not found`);
    }

    return config;
  }

  async createConfig(createConfigDto: CreateSystemConfigDto) {
    // Check if config with same key exists
    const existing = await this.prisma.systemConfig.findUnique({
      where: { key: createConfigDto.key },
    });

    if (existing) {
      throw new ConflictException('Config with same key already exists');
    }

    return this.prisma.systemConfig.create({
      data: createConfigDto,
    });
  }

  async updateConfig(key: string, updateConfigDto: UpdateSystemConfigDto) {
    // Check if config exists
    await this.getConfig(key);

    return this.prisma.systemConfig.update({
      where: { key },
      data: updateConfigDto,
    });
  }

  async deleteConfig(key: string) {
    // Check if config exists
    await this.getConfig(key);

    return this.prisma.systemConfig.delete({
      where: { key },
    });
  }

  async upsertConfig(key: string, value: string, description?: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  // ============================================
  // JOBS MANAGEMENT
  // ============================================

  async getAllJobs(limit = 100) {
    return this.prisma.scrapingJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getJobStats() {
    const [total, pending, inProgress, success, failed] = await Promise.all([
      this.prisma.scrapingJob.count(),
      this.prisma.scrapingJob.count({ where: { status: 'PENDING' } }),
      this.prisma.scrapingJob.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.scrapingJob.count({ where: { status: 'SUCCESS' } }),
      this.prisma.scrapingJob.count({ where: { status: 'FAILED' } }),
    ]);

    const recentJobs = await this.prisma.scrapingJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      total,
      pending,
      inProgress,
      success,
      failed,
      recentJobs,
    };
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalStores,
      totalPrices,
      activeTrackings,
      premiumUsers,
      freeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.store.count({ where: { isActive: true } }),
      this.prisma.price.count(),
      this.prisma.productTracking.count({ where: { isActive: true } }),
      this.prisma.subscription.count({ where: { plan: 'PREMIUM', status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { plan: 'FREE' } }),
    ]);

    // Get recent activity
    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const recentProducts = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    });

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalStores,
        totalPrices,
        activeTrackings,
        premiumUsers,
        freeUsers,
      },
      recentActivity: {
        users: recentUsers,
        products: recentProducts,
      },
    };
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: true,
        _count: {
          select: {
            productTrackings: true,
            priceAlerts: true,
            notifications: true,
          },
        },
      },
    });
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
