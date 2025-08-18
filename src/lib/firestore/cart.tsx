// src/lib/firestore/cart.ts
import { cartService } from './services';
import { CartItem } from './schemas';

// Legacy wrapper functions for backward compatibility
export const saveCartToFirestore = async (
  userId: string,
  cart: { items: CartItem[]; total: number }
) => {
  // Convert legacy format to new format and use cart service
  for (const item of cart.items) {
    await cartService.addToCart(userId, {
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      productImage: item.productImage,
      availability: item.availability || 'in_stock',
    });
  }
};

export const getCartFromFirestore = async (userId: string) => {
  const cart = await cartService.getUserCart(userId);
  if (!cart) return null;
  
  // Convert to legacy format for backward compatibility
  return {
    items: cart.items,
    total: cart.pricing.total
  };
};

