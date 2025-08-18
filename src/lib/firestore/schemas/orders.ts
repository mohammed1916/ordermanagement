// Orders collection schema
import { BaseDocument, TimestampFields } from './base';
import { Address } from './users';

export interface Order extends BaseDocument {
  orderNumber: string; // Human-readable order number
  userId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentInfo: PaymentInfo;
  pricing: OrderPricing;
  shipping: ShippingInfo;
  timeline: OrderTimeline[];
  notes?: string[];
  isGuestOrder: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  totalPrice: number;
  productImage: string;
  productSlug?: string;
}

export type OrderStatus = 
  | 'pending'           // Order created, payment pending
  | 'payment_failed'    // Payment failed
  | 'paid'             // Payment successful
  | 'processing'       // Order is being prepared
  | 'shipped'          // Order has been shipped
  | 'out_for_delivery' // Order is out for delivery
  | 'delivered'        // Order has been delivered
  | 'cancelled'        // Order was cancelled
  | 'refunded'         // Order was refunded
  | 'returned';        // Order was returned

export interface PaymentInfo {
  method: PaymentMethod;
  transactionId?: string;
  paymentId?: string; // PhonePe payment ID
  merchantTransactionId?: string; // PhonePe merchant transaction ID
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  gatewayResponse?: Record<string, any>;
}

export type PaymentMethod = 'phonepe' | 'credit_card' | 'debit_card' | 'upi' | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

export interface OrderPricing {
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export interface ShippingInfo {
  method: ShippingMethod;
  cost: number;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  carrier?: string;
  weight?: number; // in grams
}

export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup';

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  message: string;
  updatedBy?: string; // User ID or system
  isPublic: boolean; // Whether customer can see this update
}

// Cart schema (temporary storage before order creation)
export interface Cart extends BaseDocument {
  userId?: string; // Optional for guest carts
  sessionId?: string; // For guest users
  items: CartItem[];
  pricing: CartPricing;
  appliedCoupons?: AppliedCoupon[];
  lastModified: Date;
  expiresAt?: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  totalPrice: number;
  productImage: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  addedAt: Date;
}

export interface CartPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  appliedAmount: number;
}

// Collection names
export const ORDERS_COLLECTION = 'orders';
export const CARTS_COLLECTION = 'carts';

// Validation functions
export const validateOrderData = (data: Omit<Order, 'id' | 'orderNumber'>): void => {
  if (!data.userId || !data.customerInfo || !data.items || data.items.length === 0) {
    throw new Error('User ID, customer info, and items are required');
  }
  
  if (!data.shippingAddress) {
    throw new Error('Shipping address is required');
  }
  
  if (!data.paymentInfo || !data.pricing) {
    throw new Error('Payment info and pricing are required');
  }
  
  if (data.pricing.total <= 0) {
    throw new Error('Order total must be greater than 0');
  }
};

// Helper functions
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const calculateCartTotal = (items: CartItem[]): CartPricing => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const total = subtotal + shipping + tax;
  
  return {
    subtotal,
    discount: 0,
    shipping,
    tax,
    total,
    currency: 'INR'
  };
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    payment_failed: 'Payment Failed',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    returned: 'Returned'
  };
  return labels[status];
};

export const isOrderCancellable = (status: OrderStatus): boolean => {
  return ['pending', 'paid', 'processing'].includes(status);
};

export const isOrderRefundable = (status: OrderStatus): boolean => {
  return ['delivered'].includes(status);
};
