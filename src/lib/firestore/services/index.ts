// Central services exports - import all services from this file
export * from './base';
export * from './userService';
export * from './productService';
export * from './orderService';

// Re-export singleton instances for easy access
export { userService } from './userService';
export { productService, productCategoryService } from './productService';
export { orderService, cartService } from './orderService';
