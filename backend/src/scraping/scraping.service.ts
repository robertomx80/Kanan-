import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { chromium, Browser, Page } from 'playwright';
import { ScrapingStatus } from '@prisma/client';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private browser: Browser;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Initialize browser on module init
    this.logger.log('Initializing Playwright browser...');
    this.browser = await chromium.launch({
      headless: true,
    });
    this.logger.log('✅ Playwright browser initialized');
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('👋 Playwright browser closed');
    }
  }

  async scrapeProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    this.logger.log(`Scraping product: ${product.name}`);

    const stores = await this.prisma.store.findMany({
      where: { isActive: true },
    });

    const results = [];

    for (const store of stores) {
      try {
        const price = await this.scrapeProductFromStore(product, store);
        if (price) {
          results.push(price);
        }
      } catch (error) {
        this.logger.error(`Failed to scrape ${store.name}: ${error.message}`);
      }
    }

    return results;
  }

  private async scrapeProductFromStore(product: any, store: any) {
    // This is a simplified example
    // In a real implementation, you would have specific selectors for each store

    const page = await this.browser.newPage();

    try {
      // Construct search URL (this is example logic)
      const searchUrl = `${store.website}/search?q=${encodeURIComponent(product.name)}`;

      await page.goto(searchUrl, { waitUntil: 'networkidle' });

      // Wait a bit to avoid being detected as bot
      await page.waitForTimeout(
        this.configService.get<number>('SCRAPER_DELAY_BETWEEN_REQUESTS', 2000),
      );

      // Example: Try to extract price (you'd need specific selectors per store)
      // This is a placeholder - real implementation would vary per store
      const priceData = await this.extractPriceData(page, store);

      if (priceData) {
        // Save to database
        const savedPrice = await this.prisma.price.create({
          data: {
            productId: product.id,
            storeId: store.id,
            price: priceData.price,
            originalPrice: priceData.originalPrice,
            discount: priceData.discount,
            isAvailable: priceData.isAvailable,
            inStock: priceData.inStock,
            url: priceData.url,
            scrapingStatus: ScrapingStatus.SUCCESS,
          },
        });

        this.logger.log(`✅ Scraped ${store.name}: $${priceData.price}`);
        return savedPrice;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error scraping ${store.name}: ${error.message}`);

      // Log failed scraping
      await this.prisma.scrapingJob.create({
        data: {
          jobType: 'product',
          targetId: product.id,
          status: ScrapingStatus.FAILED,
          errorMessage: error.message,
          itemsFailed: 1,
        },
      });

      return null;
    } finally {
      await page.close();
    }
  }

  private async extractPriceData(page: Page, store: any) {
    // This is a placeholder implementation
    // In reality, you'd have specific selectors for each store

    try {
      // Example selectors (would be different for each store)
      const selectors = {
        price: '.price, [data-price], .product-price',
        availability: '.in-stock, [data-available]',
        url: 'a.product-link, .product-url',
      };

      // Try to extract price
      const priceElement = await page.$(selectors.price);
      if (!priceElement) {
        return null;
      }

      const priceText = await priceElement.textContent();
      const price = this.parsePrice(priceText);

      if (!price) {
        return null;
      }

      // Check availability
      const availabilityElement = await page.$(selectors.availability);
      const isAvailable = !!availabilityElement;

      // Get product URL
      const urlElement = await page.$(selectors.url);
      const url = urlElement ? await urlElement.getAttribute('href') : page.url();

      return {
        price,
        originalPrice: null,
        discount: null,
        isAvailable,
        inStock: isAvailable,
        url: url.startsWith('http') ? url : `${store.website}${url}`,
      };
    } catch (error) {
      this.logger.error(`Error extracting price data: ${error.message}`);
      return null;
    }
  }

  private parsePrice(priceText: string): number | null {
    if (!priceText) return null;

    // Remove currency symbols and parse
    const cleaned = priceText.replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(',', '.');
    const price = parseFloat(normalized);

    return isNaN(price) ? null : price;
  }

  async scrapeAllProducts() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
    });

    this.logger.log(`Starting to scrape ${products.length} products...`);

    const results = [];

    for (const product of products) {
      try {
        const prices = await this.scrapeProduct(product.id);
        results.push({ productId: product.id, success: true, prices: prices.length });
      } catch (error) {
        this.logger.error(`Failed to scrape product ${product.id}: ${error.message}`);
        results.push({ productId: product.id, success: false, error: error.message });
      }

      // Delay between products to avoid overloading servers
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    this.logger.log(`Scraping completed. Results: ${JSON.stringify(results)}`);
    return results;
  }
}
