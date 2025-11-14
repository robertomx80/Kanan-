export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  avatar?: string;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  plan: 'FREE' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  maxTrackedProducts: number;
  currentPeriodEnd?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  mainImage?: string;
  images: string[];
  category?: Category;
  currentPrices?: Price[];
  lowestPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Price {
  id: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  isAvailable: boolean;
  store: Store;
  scrapedAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo?: string;
}

export interface ProductTracking {
  id: string;
  product: Product;
  initialPrice?: number;
  lowestPrice?: number;
  highestPrice?: number;
  currentPrices?: Price[];
  lowestCurrentPrice?: number;
  priceChange?: number;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  product: Product;
  condition: 'DROPS_BELOW' | 'RISES_ABOVE' | 'PERCENTAGE_DROP' | 'ANY_CHANGE';
  targetPrice?: number;
  percentage?: number;
  isActive: boolean;
  triggeredAt?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
