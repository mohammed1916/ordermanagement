// Product service for handling product-related Firestore operations
import { query, where, orderBy, limit, QueryConstraint } from 'firebase/firestore';
import { BaseFirestoreService } from './base';
import { 
  Product, 
  ProductCategory,
  ProductVariant,
  validateProductData,
  PRODUCTS_COLLECTION,
  PRODUCT_CATEGORIES_COLLECTION,
  PRODUCT_VARIANTS_COLLECTION,
  getAvailableSizes,
  getAvailableColors,
  isProductOnSale,
  getMainProductImage
} from '../schemas/products';

export class ProductService extends BaseFirestoreService<Product> {
  constructor() {
    super(PRODUCTS_COLLECTION);
  }

  // Create a new product
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    validateProductData(productData);
    
    // Check if SKU already exists
    const existingProduct = await this.getProductBySku(productData.sku);
    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }
    
    return await this.create({
      ...productData,
      isActive: productData.isActive ?? true,
      isFeatured: productData.isFeatured ?? false,
      stockQuantity: productData.stockQuantity ?? 0,
    });
  }

  // Get product by SKU
  async getProductBySku(sku: string): Promise<Product | null> {
    const products = await this.getAll([where('sku', '==', sku)]);
    return products.length > 0 ? products[0] : null;
  }

  // Get active products
  async getActiveProducts(limitCount?: number): Promise<Product[]> {
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
      where('inStock', '==', true),
      orderBy('createdAt', 'desc')
    ];
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    return await this.getAll(constraints);
  }

  // Get featured products
  async getFeaturedProducts(limitCount: number = 10): Promise<Product[]> {
    return await this.getAll([
      where('isActive', '==', true),
      where('isFeatured', '==', true),
      where('inStock', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ]);
  }

  // Get products by category
  async getProductsByCategory(category: string, limitCount?: number): Promise<Product[]> {
    const allProducts = await this.getActiveProducts();
    const filteredProducts = allProducts.filter(product => 
      product.categories.includes(category)
    );
    
    return limitCount ? filteredProducts.slice(0, limitCount) : filteredProducts;
  }

  // Get products by multiple categories
  async getProductsByCategories(categories: string[], limitCount?: number): Promise<Product[]> {
    const allProducts = await this.getActiveProducts();
    const filteredProducts = allProducts.filter(product => 
      categories.some(cat => product.categories.includes(cat))
    );
    
    return limitCount ? filteredProducts.slice(0, limitCount) : filteredProducts;
  }

  // Get sale products
  async getSaleProducts(limitCount?: number): Promise<Product[]> {
    const allProducts = await this.getActiveProducts();
    const saleProducts = allProducts.filter(product => isProductOnSale(product));
    
    return limitCount ? saleProducts.slice(0, limitCount) : saleProducts;
  }

  // Get new arrivals (products created in last 30 days)
  async getNewArrivals(limitCount: number = 20): Promise<Product[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const allProducts = await this.getActiveProducts();
    const newProducts = allProducts.filter(product => {
      const createdAt = this.timestampToDate(product.createdAt);
      return createdAt > thirtyDaysAgo;
    });
    
    return newProducts.slice(0, limitCount);
  }

  // Search products (basic text search)
  async searchProducts(searchTerm: string, limitCount: number = 50): Promise<Product[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const allProducts = await this.getActiveProducts();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.description.toLowerCase().includes(lowerSearchTerm) ||
      product.shortDescription?.toLowerCase().includes(lowerSearchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
      product.categories.some(cat => cat.toLowerCase().includes(lowerSearchTerm))
    ).slice(0, limitCount);
  }

  // Get products with filters
  async getFilteredProducts(filters: {
    categories?: string[];
    priceMin?: number;
    priceMax?: number;
    sizes?: string[];
    colors?: string[];
    inStock?: boolean;
    onSale?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
    limit?: number;
  }): Promise<Product[]> {
    let products = await this.getActiveProducts();
    
    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      products = products.filter(product => 
        filters.categories!.some(cat => product.categories.includes(cat))
      );
    }
    
    if (filters.priceMin !== undefined) {
      products = products.filter(product => product.price >= filters.priceMin!);
    }
    
    if (filters.priceMax !== undefined) {
      products = products.filter(product => product.price <= filters.priceMax!);
    }
    
    if (filters.sizes && filters.sizes.length > 0) {
      products = products.filter(product => 
        filters.sizes!.some(size => 
          product.sizes.some(productSize => 
            productSize.name === size && productSize.isAvailable
          )
        )
      );
    }
    
    if (filters.colors && filters.colors.length > 0) {
      products = products.filter(product => 
        filters.colors!.some(color => 
          product.colors.some(productColor => 
            productColor.name === color && productColor.isAvailable
          )
        )
      );
    }
    
    if (filters.inStock !== undefined) {
      products = products.filter(product => product.inStock === filters.inStock);
    }
    
    if (filters.onSale) {
      products = products.filter(product => isProductOnSale(product));
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => {
            const dateA = this.timestampToDate(a.createdAt);
            const dateB = this.timestampToDate(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          break;
        case 'oldest':
          products.sort((a, b) => {
            const dateA = this.timestampToDate(a.createdAt);
            const dateB = this.timestampToDate(b.createdAt);
            return dateA.getTime() - dateB.getTime();
          });
          break;
      }
    }
    
    // Apply limit
    if (filters.limit) {
      products = products.slice(0, filters.limit);
    }
    
    return products;
  }

  // Update product stock
  async updateStock(productId: string, newStock: number): Promise<void> {
    if (newStock < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    
    await this.update(productId, { 
      stockQuantity: newStock,
      inStock: newStock > 0
    });
  }

  // Update product size stock
  async updateSizeStock(productId: string, sizeName: string, newStock: number): Promise<void> {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');
    
    const updatedSizes = product.sizes.map(size => 
      size.name === sizeName 
        ? { ...size, stockQuantity: newStock, isAvailable: newStock > 0 }
        : size
    );
    
    // Update overall stock status
    const totalStock = updatedSizes.reduce((sum, size) => sum + size.stockQuantity, 0);
    
    await this.update(productId, { 
      sizes: updatedSizes,
      stockQuantity: totalStock,
      inStock: totalStock > 0
    });
  }

  // Update product color stock
  async updateColorStock(productId: string, colorName: string, newStock: number): Promise<void> {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');
    
    const updatedColors = product.colors.map(color => 
      color.name === colorName 
        ? { ...color, stockQuantity: newStock, isAvailable: newStock > 0 }
        : color
    );
    
    await this.update(productId, { colors: updatedColors });
  }

  // Get low stock products (for admin)
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const allProducts = await this.getAll([where('isActive', '==', true)]);
    
    return allProducts.filter(product => 
      product.inStock && 
      product.stockQuantity <= threshold &&
      product.stockQuantity > 0
    );
  }

  // Get out of stock products (for admin)
  async getOutOfStockProducts(): Promise<Product[]> {
    return await this.getAll([
      where('isActive', '==', true),
      where('inStock', '==', false)
    ]);
  }

  // Get product stats (for admin dashboard)
  async getProductStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    featuredProducts: number;
  }> {
    const allProducts = await this.getAll();
    const activeProducts = allProducts.filter(p => p.isActive);
    const outOfStockProducts = activeProducts.filter(p => !p.inStock);
    const lowStockProducts = activeProducts.filter(p => p.inStock && p.stockQuantity <= 10);
    const featuredProducts = activeProducts.filter(p => p.isFeatured);
    
    return {
      totalProducts: allProducts.length,
      activeProducts: activeProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.length,
      featuredProducts: featuredProducts.length,
    };
  }
}

// Product Category Service
export class ProductCategoryService extends BaseFirestoreService<ProductCategory> {
  constructor() {
    super(PRODUCT_CATEGORIES_COLLECTION);
  }

  // Get active categories
  async getActiveCategories(): Promise<ProductCategory[]> {
    return await this.getAll([
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    ]);
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    const categories = await this.getAll([where('slug', '==', slug)]);
    return categories.length > 0 ? categories[0] : null;
  }

  // Get parent categories (no parentId)
  async getParentCategories(): Promise<ProductCategory[]> {
    const allCategories = await this.getActiveCategories();
    return allCategories.filter(category => !category.parentId);
  }

  // Get subcategories of a parent
  async getSubcategories(parentId: string): Promise<ProductCategory[]> {
    return await this.getAll([
      where('isActive', '==', true),
      where('parentId', '==', parentId),
      orderBy('sortOrder', 'asc')
    ]);
  }
}

// Export singleton instances
export const productService = new ProductService();
export const productCategoryService = new ProductCategoryService();
