// Order completion utilities
import { orderService, cartService } from './services';
import { Order, CartItem, Cart, OrderItem } from './schemas';
import { User } from 'firebase/auth';

export interface CheckoutData {
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'phonepe' | 'credit_card' | 'cash_on_delivery';
  paymentDetails?: {
    transactionId?: string;
    paymentId?: string;
    merchantTransactionId?: string;
  };
  specialInstructions?: string;
}

export interface OrderProcessingResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * Process cart to order - converts cart items to order and clears cart
 */
export const processCartToOrder = async (
  user: User,
  checkoutData: CheckoutData
): Promise<OrderProcessingResult> => {
  try {
    // Get user's cart
    const cart = await cartService.getUserCart(user.uid);
    
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: 'Cart is empty or not found'
      };
    }

    // Convert cart items to order items
    const orderItems: OrderItem[] = cart.items.map((cartItem: CartItem) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: cartItem.productId,
      productName: cartItem.productName,
      productSku: cartItem.productSku,
      quantity: cartItem.quantity,
      size: cartItem.size,
      color: cartItem.color,
      unitPrice: cartItem.unitPrice,
      totalPrice: cartItem.totalPrice,
      productImage: cartItem.productImage,
      productSlug: cartItem.productId
    }));

    // Create order data
    const orderCreateData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
      userId: user.uid,
      items: orderItems,
      pricing: {
        subtotal: cart.pricing.subtotal,
        discount: cart.pricing.discount,
        shipping: cart.pricing.shipping,
        tax: cart.pricing.tax,
        total: cart.pricing.total,
        currency: cart.pricing.currency
      },
      shippingAddress: {
        ...checkoutData.shippingAddress,
        type: 'other' as const,
        isDefault: false
      },
      customerInfo: {
        name: checkoutData.customerInfo.name,
        email: user.email || checkoutData.customerInfo.email,
        phoneNumber: checkoutData.customerInfo.phoneNumber
      },
      paymentInfo: {
        method: checkoutData.paymentMethod,
        status: 'pending',
        amount: cart.pricing.total,
        currency: 'INR',
        ...(checkoutData.paymentDetails?.transactionId && { 
          transactionId: checkoutData.paymentDetails.transactionId 
        }),
        ...(checkoutData.paymentDetails?.paymentId && { 
          paymentId: checkoutData.paymentDetails.paymentId 
        }),
        ...(checkoutData.paymentDetails?.merchantTransactionId && { 
          merchantTransactionId: checkoutData.paymentDetails.merchantTransactionId 
        })
      },
      shipping: {
        method: 'standard',
        cost: cart.pricing.shipping,
        estimatedDelivery: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days from now
      },
      status: 'pending',
      timeline: [],
      isGuestOrder: false,
      ...(checkoutData.specialInstructions && { 
        notes: [checkoutData.specialInstructions] 
      })
    };

    // Create the order
    const orderId = await orderService.createOrder(orderCreateData);

    // Get the created order to get the order number
    const createdOrder = await orderService.getById(orderId);
    
    if (!createdOrder) {
      throw new Error('Failed to retrieve created order');
    }

    // Clear the cart after successful order creation
    await cartService.clearCart(user.uid);

    return {
      success: true,
      orderId,
      orderNumber: createdOrder.orderNumber
    };

  } catch (error) {
    console.error('Error processing cart to order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Update order after payment completion
 */
export const completeOrderPayment = async (
  orderId: string,
  paymentData: {
    transactionId: string;
    paymentId?: string;
    merchantTransactionId?: string;
    paidAt?: Date;
    gatewayResponse?: Record<string, any>;
  }
): Promise<boolean> => {
  try {
    await orderService.updatePaymentStatus(orderId, 'completed', {
      ...paymentData,
      paidAt: paymentData.paidAt || new Date()
    });
    return true;
  } catch (error) {
    console.error('Error completing order payment:', error);
    return false;
  }
};

/**
 * Handle payment failure
 */
export const handleOrderPaymentFailure = async (
  orderId: string,
  errorReason: string
): Promise<boolean> => {
  try {
    await orderService.updatePaymentStatus(orderId, 'failed', {
      failureReason: errorReason,
      failedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error handling order payment failure:', error);
    return false;
  }
};

/**
 * Get order for success page (by ID or order number)
 */
export const getOrderForSuccess = async (
  orderId?: string,
  orderNumber?: string
): Promise<Order | null> => {
  try {
    if (orderId) {
      return await orderService.getById(orderId);
    } else if (orderNumber) {
      return await orderService.getOrderByOrderNumber(orderNumber);
    }
    return null;
  } catch (error) {
    console.error('Error fetching order for success page:', error);
    return null;
  }
};

/**
 * Validate cart before checkout
 */
export const validateCartForCheckout = async (userId: string): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  
  try {
    const cart = await cartService.getUserCart(userId);
    
    if (!cart) {
      errors.push('Cart not found');
      return { isValid: false, errors };
    }
    
    if (cart.items.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors };
    }
    
    // Check if all cart items are still valid
    for (const item of cart.items) {
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.productName}`);
      }
      if (item.unitPrice <= 0) {
        errors.push(`Invalid price for ${item.productName}`);
      }
    }
    
    if (cart.pricing.total <= 0) {
      errors.push('Invalid cart total');
    }
    
    return { isValid: errors.length === 0, errors };
    
  } catch (error) {
    console.error('Error validating cart:', error);
    errors.push('Failed to validate cart');
    return { isValid: false, errors };
  }
};
