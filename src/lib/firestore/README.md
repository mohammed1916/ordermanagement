# Firebase Schema Modularization

This document explains the modular Firebase schema organization implemented for the TeemAvenue e-commerce application.

## Overview

The Firebase schema has been reorganized into a modular structure that provides:

- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Validation**: Built-in validation functions for data integrity
- **Service Layer**: Dedicated service classes for each collection
- **Scalability**: Easy to extend and maintain as the application grows
- **Consistency**: Standardized patterns across all collections

## Directory Structure

```
src/lib/firestore/
├── schemas/
│   ├── base.ts          # Base interfaces and utilities
│   ├── users.ts         # User and address schemas
│   ├── products.ts      # Product and category schemas
│   ├── orders.ts        # Order and cart schemas
│   ├── misc.ts          # Coupons, reviews, notifications, etc.
│   └── index.ts         # Central schema exports
├── services/
│   ├── base.ts          # Base service class
│   ├── userService.ts   # User management service
│   ├── productService.ts# Product management service
│   ├── orderService.ts  # Order and cart management service
│   └── index.ts         # Central service exports
├── cart.tsx             # Legacy compatibility wrapper
└── deliveries.ts        # Legacy compatibility wrapper
```

## Core Collections

### 1. Users Collection (`users`)

**Schema**: `UserProfile`

**Key Features**:

- User preferences and settings
- Multiple saved addresses
- Admin role management
- Email verification status

**Service**: `UserService`

**Common Operations**:

```typescript
import { userService } from "@/lib/firestore/services";

// Create user
const userId = await userService.createUser(userData);

// Get user by email
const user = await userService.getUserByEmail(email);

// Add address
await userService.addAddress(userId, addressData);

// Update preferences
await userService.updatePreferences(userId, preferences);
```

### 2. Products Collection (`products`)

**Schema**: `Product`

**Key Features**:

- Multiple images with color variants
- Size and color availability tracking
- Stock management at variant level
- SEO optimization data
- Category and tag support

**Service**: `ProductService`

**Common Operations**:

```typescript
import { productService } from "@/lib/firestore/services";

// Get active products
const products = await productService.getActiveProducts();

// Search products
const searchResults = await productService.searchProducts("t-shirt");

// Get filtered products
const filtered = await productService.getFilteredProducts({
  categories: ["men"],
  priceMin: 100,
  priceMax: 500,
  sortBy: "price_asc",
});

// Update stock
await productService.updateStock(productId, newQuantity);
```

### 3. Orders Collection (`orders`)

**Schema**: `Order`

**Key Features**:

- Comprehensive order lifecycle tracking
- Payment integration support
- Shipping and delivery management
- Order timeline with status updates
- Support for guest orders

**Service**: `OrderService`

**Common Operations**:

```typescript
import { orderService } from "@/lib/firestore/services";

// Create order
const orderId = await orderService.createOrder(orderData);

// Get user orders
const userOrders = await orderService.getOrdersByUser(userId);

// Update order status
await orderService.updateOrderStatus(orderId, "shipped", "Order dispatched");

// Cancel order
await orderService.cancelOrder(orderId, "Customer requested cancellation");
```

### 4. Carts Collection (`carts`)

**Schema**: `Cart`

**Key Features**:

- User-specific cart storage
- Automatic pricing calculations
- Coupon application support
- Item availability tracking

**Service**: `CartService`

**Common Operations**:

```typescript
import { cartService } from "@/lib/firestore/services";

// Get user cart
const cart = await cartService.getUserCart(userId);

// Add to cart
await cartService.addToCart(userId, itemData);

// Update quantity
await cartService.updateCartItemQuantity(userId, itemId, 3);

// Clear cart
await cartService.clearCart(userId);
```

## Additional Collections

### Product Categories (`productCategories`)

- Hierarchical category structure
- SEO-friendly slugs
- Category-specific metadata

### Product Reviews (`productReviews`)

- User reviews and ratings
- Admin approval system
- Review helpfulness tracking

### Coupons (`coupons`)

- Discount code management
- Usage tracking and limits
- Product/category-specific coupons

### Wishlists (`wishlists`)

- User wishlist management
- Shareable wishlist support

### Notifications (`notifications`)

- User notification system
- Multiple notification types
- Read/unread status tracking

### Analytics Collections

- Product view tracking (`productViews`)
- Search query analysis (`searchQueries`)
- Inventory transaction logs (`inventoryTransactions`)

## Key Features

### 1. Type Safety

All schemas are fully typed with TypeScript:

```typescript
interface Product extends BaseDocument {
  name: string;
  price: number;
  inStock: boolean;
  // ... more properties
}
```

### 2. Validation

Built-in validation functions ensure data integrity:

```typescript
export const validateProductData = (data: Omit<Product, "id">): void => {
  if (!data.name || !data.price || data.price <= 0) {
    throw new Error("Invalid product data");
  }
};
```

### 3. Base Service Pattern

All services extend a base service class with common CRUD operations:

```typescript
class UserService extends BaseFirestoreService<UserProfile> {
  // Custom user-specific methods
}
```

### 4. Helper Functions

Utility functions for common operations:

```typescript
export const calculateCartTotal = (items: CartItem[]): CartPricing => {
  // Automatic tax and shipping calculation
};

export const generateOrderNumber = (): string => {
  // Human-readable order number generation
};
```

## Security Rules

The Firestore security rules have been updated to support the new schema:

- **Users**: Users can read/write their own data, admins can read all
- **Products**: Public read access, admin write access
- **Orders**: Users can create and read their orders, admins have full access
- **Carts**: Users can only access their own carts
- **Reviews**: Users can write reviews, only approved reviews are publicly visible

## Indexes

Composite indexes have been configured for optimal query performance:

- Product filtering by category, stock status, and date
- Order queries by user and status
- Review queries by product and approval status
- Notification queries by user and read status

## Migration Path

### For Existing Code

Legacy wrapper functions are provided for backward compatibility:

```typescript
// Old way (still works)
import { saveCartToFirestore } from "@/lib/firestore/cart";

// New way (recommended)
import { cartService } from "@/lib/firestore/services";
await cartService.addToCart(userId, itemData);
```

### Gradual Migration

1. Update imports to use the new service layer
2. Replace direct Firestore calls with service methods
3. Update data structures to use the new schemas
4. Remove legacy wrapper functions when no longer needed

## Benefits

1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Easy to add new collections and features
3. **Type Safety**: Compile-time error checking
4. **Consistency**: Standardized patterns across the application
5. **Performance**: Optimized queries with proper indexing
6. **Security**: Comprehensive security rules

## Usage Examples

### Complete Product Flow

```typescript
import {
  productService,
  cartService,
  orderService,
} from "@/lib/firestore/services";

// 1. Search for products
const products = await productService.searchProducts("t-shirt");

// 2. Add to cart
await cartService.addToCart(userId, {
  productId: products[0].id!,
  productName: products[0].name,
  quantity: 2,
  size: "L",
  color: "blue",
  unitPrice: products[0].price,
  // ... other required fields
});

// 3. Create order
const cart = await cartService.getUserCart(userId);
const orderData = {
  userId,
  items: cart.items.map((item) => ({
    // Convert cart item to order item
  })),
  // ... other order data
};
const orderId = await orderService.createOrder(orderData);
```

This modular approach provides a solid foundation for scaling the TeemAvenue e-commerce application while maintaining code quality and developer productivity.
