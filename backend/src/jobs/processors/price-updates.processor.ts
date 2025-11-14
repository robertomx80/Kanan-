import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ScrapingService } from '../../scraping/scraping.service';

@Processor('price-updates')
export class PriceUpdatesProcessor {
  private readonly logger = new Logger(PriceUpdatesProcessor.name);

  constructor(private scrapingService: ScrapingService) {}

  @Process('scrape-product')
  async handleScrapeProduct(job: Job) {
    this.logger.log(`Processing price update for product: ${job.data.productId}`);

    try {
      await this.scrapingService.scrapeProduct(job.data.productId);
      this.logger.log(`✅ Completed price update for product: ${job.data.productId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to update prices for ${job.data.productId}: ${error.message}`);
      throw error;
    }
  }
}
