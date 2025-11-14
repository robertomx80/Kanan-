import { PrismaClient, UserRole, SubscriptionPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning database...');
    await prisma.notification.deleteMany();
    await prisma.priceAlert.deleteMany();
    await prisma.productTracking.deleteMany();
    await prisma.price.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.category.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pricetracking.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      subscription: {
        create: {
          plan: SubscriptionPlan.PREMIUM,
          maxTrackedProducts: -1,
        },
      },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test users
  const testUser = await prisma.user.create({
    data: {
      email: 'user@test.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      isEmailVerified: true,
      subscription: {
        create: {
          plan: SubscriptionPlan.FREE,
          maxTrackedProducts: 1,
        },
      },
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electrónica',
        slug: 'electronica',
        description: 'Productos electrónicos y tecnología',
        icon: '📱',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Computadoras',
        slug: 'computadoras',
        description: 'Laptops, PCs, componentes',
        icon: '💻',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hogar',
        slug: 'hogar',
        description: 'Artículos para el hogar',
        icon: '🏠',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Deportes',
        slug: 'deportes',
        description: 'Artículos deportivos',
        icon: '⚽',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Moda',
        slug: 'moda',
        description: 'Ropa y accesorios',
        icon: '👕',
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // Create stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'Amazon México',
        slug: 'amazon-mx',
        website: 'https://www.amazon.com.mx',
        logo: 'https://logo.clearbit.com/amazon.com.mx',
        isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Mercado Libre',
        slug: 'mercado-libre',
        website: 'https://www.mercadolibre.com.mx',
        logo: 'https://logo.clearbit.com/mercadolibre.com.mx',
        isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Liverpool',
        slug: 'liverpool',
        website: 'https://www.liverpool.com.mx',
        logo: 'https://logo.clearbit.com/liverpool.com.mx',
        isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Walmart',
        slug: 'walmart',
        website: 'https://www.walmart.com.mx',
        logo: 'https://logo.clearbit.com/walmart.com.mx',
        isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Coppel',
        slug: 'coppel',
        website: 'https://www.coppel.com',
        logo: 'https://logo.clearbit.com/coppel.com',
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${stores.length} stores created`);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        categoryId: categories[0].id,
        mainImage: 'https://via.placeholder.com/400x400.png?text=iPhone+15+Pro',
        images: [
          'https://via.placeholder.com/400x400.png?text=iPhone+15+Pro+1',
          'https://via.placeholder.com/400x400.png?text=iPhone+15+Pro+2',
        ],
        features: ['5G', '256GB Storage', 'A17 Pro Chip', 'ProMotion Display'],
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air M2 13" 256GB',
        slug: 'macbook-air-m2-13-256gb',
        description: 'Laptop ultrafina con chip M2 de Apple',
        brand: 'Apple',
        model: 'MacBook Air 2023',
        categoryId: categories[1].id,
        mainImage: 'https://via.placeholder.com/400x400.png?text=MacBook+Air+M2',
        images: [
          'https://via.placeholder.com/400x400.png?text=MacBook+1',
          'https://via.placeholder.com/400x400.png?text=MacBook+2',
        ],
        features: ['M2 Chip', '8GB RAM', '256GB SSD', 'Retina Display'],
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra 512GB',
        slug: 'samsung-galaxy-s24-ultra-512gb',
        description: 'Smartphone premium con S Pen y cámara de 200MP',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        categoryId: categories[0].id,
        mainImage: 'https://via.placeholder.com/400x400.png?text=Galaxy+S24',
        images: [
          'https://via.placeholder.com/400x400.png?text=Galaxy+1',
          'https://via.placeholder.com/400x400.png?text=Galaxy+2',
        ],
        features: ['200MP Camera', 'S Pen', '512GB Storage', '5G'],
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sony PlayStation 5 Digital Edition',
        slug: 'playstation-5-digital',
        description: 'Consola de videojuegos de última generación',
        brand: 'Sony',
        model: 'PS5 Digital',
        categoryId: categories[0].id,
        mainImage: 'https://via.placeholder.com/400x400.png?text=PS5',
        images: ['https://via.placeholder.com/400x400.png?text=PS5+1'],
        features: ['4K Gaming', 'Ray Tracing', 'Ultra HD Blu-ray', 'SSD 825GB'],
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${products.length} products created`);

  // Create sample prices for products
  const now = new Date();
  const priceHistory = [];

  for (const product of products) {
    for (const store of stores.slice(0, 3)) {
      // Create price history for last 30 days
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const basePrice = Math.random() * 10000 + 5000;
        const variation = Math.random() * 1000 - 500;
        const price = basePrice + variation;

        priceHistory.push(
          prisma.price.create({
            data: {
              productId: product.id,
              storeId: store.id,
              price: parseFloat(price.toFixed(2)),
              currency: 'MXN',
              isAvailable: true,
              inStock: Math.random() > 0.1,
              url: `${store.website}/product/${product.slug}`,
              scrapedAt: date,
              createdAt: date,
            },
          }),
        );
      }
    }
  }

  await Promise.all(priceHistory);
  console.log(`✅ ${priceHistory.length} price records created`);

  // Create sample tracking for test user
  const tracking = await prisma.productTracking.create({
    data: {
      userId: testUser.id,
      productId: products[0].id,
      isActive: true,
      initialPrice: 25999,
      lowestPrice: 24500,
      highestPrice: 27000,
    },
  });
  console.log('✅ Sample tracking created');

  // Create sample price alert
  const alert = await prisma.priceAlert.create({
    data: {
      userId: testUser.id,
      productId: products[0].id,
      condition: 'DROPS_BELOW',
      targetPrice: 24000,
      isActive: true,
    },
  });
  console.log('✅ Sample price alert created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Categories: ${await prisma.category.count()}`);
  console.log(`   Stores: ${await prisma.store.count()}`);
  console.log(`   Products: ${await prisma.product.count()}`);
  console.log(`   Prices: ${await prisma.price.count()}`);
  console.log(`   Trackings: ${await prisma.productTracking.count()}`);
  console.log(`   Alerts: ${await prisma.priceAlert.count()}`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@pricetracking.com / admin123');
  console.log('   User:  user@test.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
