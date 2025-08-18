// Central schema exports - import all schemas from this file
export * from './base';
export * from './users';
export * from './products';
export * from './orders';
export * from './misc';

// Collection name constants for easy reference
export const COLLECTION_NAMES = {
  // Core collections
  USERS: 'users',
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'productCategories',
  PRODUCT_VARIANTS: 'productVariants',
  ORDERS: 'orders',
  CARTS: 'carts',
  
  // Marketing & Sales
  COUPONS: 'coupons',
  COUPON_USAGE: 'couponUsage',
  WISHLISTS: 'wishlists',
  PRODUCT_REVIEWS: 'productReviews',
  
  // Analytics
  PRODUCT_VIEWS: 'productViews',
  SEARCH_QUERIES: 'searchQueries',
  
  // Operations
  INVENTORY_TRANSACTIONS: 'inventoryTransactions',
  NOTIFICATIONS: 'notifications',
} as const;

// Type for collection names
export type CollectionName = typeof COLLECTION_NAMES[keyof typeof COLLECTION_NAMES];

// Database schema version for migrations
export const SCHEMA_VERSION = '1.0.0';

// Common query patterns and limits
export const QUERY_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SEARCH_RESULTS: 50,
  RECENT_ITEMS: 10,
  POPULAR_ITEMS: 20,
} as const;

// Field index configurations for better query performance
export const FIELD_INDEXES = {
  PRODUCTS: [
    'category',
    'inStock',
    'isActive',
    'isFeatured',
    'createdAt',
    'price',
  ],
  ORDERS: [
    'userId',
    'status',
    'createdAt',
    'orderNumber',
  ],
  USERS: [
    'email',
    'isAdmin',
    'createdAt',
  ],
  REVIEWS: [
    'productId',
    'rating',
    'isApproved',
    'createdAt',
  ],
  COUPONS: [
    'code',
    'isActive',
    'validFrom',
    'validUntil',
  ],
} as const;

// Composite index configurations
export const COMPOSITE_INDEXES = [
  // Products
  {
    collectionGroup: 'products',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'category', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: 'products',
    fields: [
      { fieldPath: 'inStock', order: 'ASCENDING' },
      { fieldPath: 'price', order: 'ASCENDING' },
    ],
  },
  
  // Orders
  {
    collectionGroup: 'orders',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: 'orders',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  
  // Reviews
  {
    collectionGroup: 'productReviews',
    fields: [
      { fieldPath: 'productId', order: 'ASCENDING' },
      { fieldPath: 'isApproved', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
] as const;
