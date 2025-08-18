// Coupons and promotions schema
import { BaseDocument } from './base';

export interface Coupon extends BaseDocument {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerUser?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: string[]; // Product IDs
  applicableCategories?: string[]; // Category IDs
  excludedProducts?: string[]; // Product IDs
  excludedCategories?: string[]; // Category IDs
  firstTimeUserOnly: boolean;
  stackable: boolean; // Can be combined with other coupons
}

export type CouponType = 'general' | 'welcome' | 'loyalty' | 'seasonal' | 'flash_sale';

export interface CouponUsage extends BaseDocument {
  couponId: string;
  couponCode: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Date;
}

// Analytics and tracking schema
export interface ProductView extends BaseDocument {
  productId: string;
  userId?: string; // Optional for guest users
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  viewedAt: Date;
}

export interface SearchQuery extends BaseDocument {
  query: string;
  userId?: string;
  sessionId: string;
  resultsCount: number;
  selectedResult?: string; // Product ID if user clicked on a result
  searchedAt: Date;
}

// Reviews and ratings schema
export interface ProductReview extends BaseDocument {
  productId: string;
  userId: string;
  orderId?: string; // Link to purchase
  rating: number; // 1-5 stars
  title?: string;
  comment?: string;
  images?: string[]; // Review images
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  reportCount: number;
  response?: AdminResponse; // Store response from admin
}

export interface AdminResponse {
  message: string;
  respondedBy: string; // Admin user ID
  respondedAt: Date;
}

// Wishlist schema
export interface Wishlist extends BaseDocument {
  userId: string;
  items: WishlistItem[];
  isPublic: boolean;
  shareableId?: string; // For sharing wishlists
}

export interface WishlistItem {
  productId: string;
  addedAt: Date;
  size?: string;
  color?: string;
  notes?: string;
}

// Inventory management schema
export interface InventoryTransaction extends BaseDocument {
  productId: string;
  variantId?: string;
  type: InventoryTransactionType;
  quantity: number; // Positive for additions, negative for reductions
  reason: string;
  referenceId?: string; // Order ID, return ID, etc.
  performedBy: string; // User ID
  notes?: string;
}

export type InventoryTransactionType = 
  | 'purchase' // New stock received
  | 'sale' // Stock sold
  | 'return' // Stock returned
  | 'adjustment' // Manual adjustment
  | 'damage' // Damaged stock
  | 'theft' // Stock theft
  | 'gift' // Promotional giveaway
  | 'sample'; // Sample given

// Notifications schema
export interface Notification extends BaseDocument {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // Additional data for the notification
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string; // Deep link for the notification
  expiresAt?: Date;
}

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_failed'
  | 'low_stock_alert'
  | 'back_in_stock'
  | 'price_drop'
  | 'new_product'
  | 'promotion'
  | 'review_request'
  | 'system';

// Collection names
export const COUPONS_COLLECTION = 'coupons';
export const COUPON_USAGE_COLLECTION = 'couponUsage';
export const PRODUCT_VIEWS_COLLECTION = 'productViews';
export const SEARCH_QUERIES_COLLECTION = 'searchQueries';
export const PRODUCT_REVIEWS_COLLECTION = 'productReviews';
export const WISHLISTS_COLLECTION = 'wishlists';
export const INVENTORY_TRANSACTIONS_COLLECTION = 'inventoryTransactions';
export const NOTIFICATIONS_COLLECTION = 'notifications';

// Validation functions
export const validateCouponData = (data: Omit<Coupon, 'id'>): void => {
  if (!data.code || !data.name || !data.discountValue) {
    throw new Error('Code, name, and discount value are required');
  }
  
  if (data.discountType === 'percentage' && (data.discountValue <= 0 || data.discountValue > 100)) {
    throw new Error('Percentage discount must be between 1 and 100');
  }
  
  if (data.discountType === 'fixed' && data.discountValue <= 0) {
    throw new Error('Fixed discount must be greater than 0');
  }
  
  if (data.validFrom >= data.validUntil) {
    throw new Error('Valid from date must be before valid until date');
  }
};

export const validateProductReview = (data: Omit<ProductReview, 'id'>): void => {
  if (!data.productId || !data.userId || !data.rating) {
    throw new Error('Product ID, user ID, and rating are required');
  }
  
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  if (data.comment && data.comment.length > 1000) {
    throw new Error('Review comment cannot exceed 1000 characters');
  }
};

// Helper functions
export const isCouponValid = (coupon: Coupon, orderAmount: number = 0): boolean => {
  const now = new Date();
  
  if (!coupon.isActive) return false;
  if (now < coupon.validFrom || now > coupon.validUntil) return false;
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return false;
  if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) return false;
  
  return true;
};

export const calculateCouponDiscount = (coupon: Coupon, orderAmount: number): number => {
  if (!isCouponValid(coupon, orderAmount)) return 0;
  
  let discount = 0;
  
  if (coupon.discountType === 'percentage') {
    discount = (orderAmount * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }
  
  // Apply maximum discount limit if set
  if (coupon.maximumDiscountAmount && discount > coupon.maximumDiscountAmount) {
    discount = coupon.maximumDiscountAmount;
  }
  
  return Math.round(discount * 100) / 100;
};
