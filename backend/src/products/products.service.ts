import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const slug = this.generateSlug(createProductDto.name);

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        slug,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(searchDto: SearchProductDto) {
    const { query, categoryId, brand, minPrice, maxPrice, page, limit, sortBy, sortOrder } =
      searchDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
    };

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: this.buildOrderBy(sortBy, sortOrder),
      include: {
        category: true,
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            store: true,
          },
        },
      },
    });

    // Filter by price if specified (after getting latest prices)
    let filteredProducts = products;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filteredProducts = products.filter((product) => {
        if (product.prices.length === 0) return false;
        const latestPrice = product.prices[0].price;
        if (minPrice !== undefined && latestPrice < minPrice) return false;
        if (maxPrice !== undefined && latestPrice > maxPrice) return false;
        return true;
      });
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Transform to include price info
    const productsWithPrices = await Promise.all(
      filteredProducts.map(async (product) => {
        const currentPrices = await this.getCurrentPrices(product.id);
        const lowestPrice = currentPrices.length > 0 ? Math.min(...currentPrices.map((p) => p.price)) : null;

        return {
          ...product,
          currentPrices,
          lowestPrice,
        };
      }),
    );

    return {
      data: productsWithPrices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get current prices from all stores
    const currentPrices = await this.getCurrentPrices(id);

    // Get price history (last 30 days)
    const priceHistory = await this.getPriceHistory(id, 30);

    return {
      ...product,
      currentPrices,
      priceHistory,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const slug = updateProductDto.name ? this.generateSlug(updateProductDto.name) : undefined;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(slug && { slug }),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({ where: { id } });

    return { message: 'Product deleted successfully' };
  }

  async getCurrentPrices(productId: string) {
    // Get the latest price for each store
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

  async getPriceHistory(productId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.price.findMany({
      where: {
        productId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        store: true,
      },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
    const validSortFields = ['name', 'createdAt', 'brand'];

    if (validSortFields.includes(sortBy)) {
      return { [sortBy]: sortOrder };
    }

    return { createdAt: sortOrder };
  }
}
