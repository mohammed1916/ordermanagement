// Products collection schema
import { BaseDocument } from './base';

export interface Product extends BaseDocument {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number; // For sale items
  discount?: number; // Percentage discount
  sku: string;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  categories: string[];
  tags?: string[];
  inStock: boolean;
  stockQuantity: number;
  minStockLevel?: number;
  weight?: number; // in grams
  dimensions?: ProductDimensions;
  material?: string;
  careInstructions?: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoData?: SEOData;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
  colorVariant?: string;
  order: number;
}

export interface ProductSize {
  id: string;
  name: string; // S, M, L, XL, etc.
  measurements?: SizeMeasurements;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface SizeMeasurements {
  chest?: number; // in cm
  length?: number; // in cm
  shoulder?: number; // in cm
  sleeve?: number; // in cm
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  className: string; // CSS class for styling
  stockQuantity: number;
  isAvailable: boolean;
  images?: string[]; // Color-specific images
}

export interface ProductDimensions {
  length: number; // in cm
  width: number; // in cm  
  height: number; // in cm
}

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug: string;
}

// Product variant (combination of size and color)
export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  price?: number; // Override base price if needed
  isAvailable: boolean;
}

// Product categories
export interface ProductCategory extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string; // For nested categories
  isActive: boolean;
  sortOrder: number;
  seoData?: SEOData;
}

// Collection names
export const PRODUCTS_COLLECTION = 'products';
export const PRODUCT_CATEGORIES_COLLECTION = 'productCategories';
export const PRODUCT_VARIANTS_COLLECTION = 'productVariants';

// Validation functions
export const validateProductData = (data: Omit<Product, 'id'>): void => {
  if (!data.name || !data.description || !data.price || !data.sku) {
    throw new Error('Name, description, price, and SKU are required');
  }
  
  if (data.price <= 0) {
    throw new Error('Price must be greater than 0');
  }
  
  if (data.stockQuantity < 0) {
    throw new Error('Stock quantity cannot be negative');
  }
  
  if (!data.images || data.images.length === 0) {
    throw new Error('At least one product image is required');
  }
  
  if (!data.sizes || data.sizes.length === 0) {
    throw new Error('At least one size option is required');
  }
  
  if (!data.colors || data.colors.length === 0) {
    throw new Error('At least one color option is required');
  }
};

// Helper functions
export const calculateDiscountedPrice = (price: number, discount: number): number => {
  return Math.round(price * (1 - discount / 100) * 100) / 100;
};

export const isProductOnSale = (product: Product): boolean => {
  return Boolean(product.discount && product.discount > 0);
};

export const getMainProductImage = (product: Product): ProductImage | null => {
  return product.images.find(img => img.isMain) || product.images[0] || null;
};

export const getAvailableSizes = (product: Product): ProductSize[] => {
  return product.sizes.filter(size => size.isAvailable && size.stockQuantity > 0);
};

export const getAvailableColors = (product: Product): ProductColor[] => {
  return product.colors.filter(color => color.isAvailable && color.stockQuantity > 0);
};
