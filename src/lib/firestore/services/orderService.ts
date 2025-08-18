// Order and Cart service for handling order-related Firestore operations
import { query, where, orderBy, limit } from 'firebase/firestore';
import { BaseFirestoreService } from './base';
import { 
  Order, 
  Cart,
  OrderItem,
  CartItem,
  OrderStatus,
  PaymentStatus,
  validateOrderData,
  generateOrderNumber,
  calculateCartTotal,
  getOrderStatusLabel,
  isOrderCancellable,
  isOrderRefundable,
  ORDERS_COLLECTION,
  CARTS_COLLECTION
} from '../schemas/orders';

export class OrderService extends BaseFirestoreService<Order> {
  constructor() {
    super(ORDERS_COLLECTION);
  }

  // Create a new order
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string> {
    validateOrderData(orderData);
    
    const orderNumber = generateOrderNumber();
    
    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      ...orderData,
      orderNumber,
      status: 'pending',
      timeline: [{
        id: `timeline_${Date.now()}`,
        status: 'pending',
        timestamp: new Date(),
        message: 'Order created',
        isPublic: true,
      }],
    };
    
    return await this.create(order);
  }

  // Get orders by user
  async getOrdersByUser(userId: string, limitCount?: number): Promise<Order[]> {
    const allOrders = await this.getAll([
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ]);
    
    return limitCount ? allOrders.slice(0, limitCount) : allOrders;
  }

  // Get order by order number
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    const orders = await this.getAll([where('orderNumber', '==', orderNumber)]);
    return orders.length > 0 ? orders[0] : null;
  }

  // Get orders by status
  async getOrdersByStatus(status: OrderStatus, limitCount?: number): Promise<Order[]> {
    const allOrders = await this.getAll([
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    ]);
    
    return limitCount ? allOrders.slice(0, limitCount) : allOrders;
  }

  // Update order status
  async updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    message: string,
    updatedBy?: string
  ): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) throw new Error('Order not found');
    
    const timeline = [...order.timeline, {
      id: `timeline_${Date.now()}`,
      status: newStatus,
      timestamp: new Date(),
      message,
      updatedBy,
      isPublic: !['cancelled', 'refunded'].includes(newStatus), // Hide sensitive updates
    }];
    
    await this.update(orderId, { status: newStatus, timeline });
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string, cancelledBy?: string): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) throw new Error('Order not found');
    
    if (!isOrderCancellable(order.status)) {
      throw new Error(`Order cannot be cancelled in ${order.status} status`);
    }
    
    await this.updateOrderStatus(
      orderId, 
      'cancelled', 
      `Order cancelled. Reason: ${reason}`,
      cancelledBy
    );
  }

  // Update payment status
  async updatePaymentStatus(
    orderId: string, 
    paymentStatus: PaymentStatus,
    transactionData?: Record<string, any>
  ): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) throw new Error('Order not found');
    
    const updatedPaymentInfo = {
      ...order.paymentInfo,
      status: paymentStatus,
      ...(transactionData && { gatewayResponse: transactionData }),
      ...(paymentStatus === 'completed' && { paidAt: new Date() }),
    };
    
    const newOrderStatus: OrderStatus = paymentStatus === 'completed' ? 'paid' : 
                                       paymentStatus === 'failed' ? 'payment_failed' : 
                                       order.status;
    
    await this.update(orderId, { 
      paymentInfo: updatedPaymentInfo,
      ...(newOrderStatus !== order.status && { status: newOrderStatus })
    });
    
    if (newOrderStatus !== order.status) {
      await this.updateOrderStatus(
        orderId,
        newOrderStatus,
        paymentStatus === 'completed' ? 'Payment successful' : 'Payment failed'
      );
    }
  }

  // Add tracking information
  async addTrackingInfo(
    orderId: string, 
    trackingNumber: string, 
    carrier: string
  ): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) throw new Error('Order not found');
    
    const updatedShipping = {
      ...order.shipping,
      trackingNumber,
      carrier,
    };
    
    await this.update(orderId, { shipping: updatedShipping });
    await this.updateOrderStatus(
      orderId,
      'shipped',
      `Order shipped with tracking number: ${trackingNumber}`
    );
  }

  // Get recent orders (for admin dashboard)
  async getRecentOrders(limitCount: number = 20): Promise<Order[]> {
    const allOrders = await this.getAll([orderBy('createdAt', 'desc')]);
    return allOrders.slice(0, limitCount);
  }

  // Get orders by date range
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const allOrders = await this.getAll([orderBy('createdAt', 'desc')]);
    
    return allOrders.filter(order => {
      const orderDate = this.timestampToDate(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  // Get order statistics
  async getOrderStats(dateRange?: { start: Date; end: Date }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    topProducts: { productId: string; productName: string; quantity: number }[];
  }> {
    let orders = await this.getAll();
    
    if (dateRange) {
      orders = orders.filter(order => {
        const orderDate = this.timestampToDate(order.createdAt);
        return orderDate >= dateRange.start && orderDate <= dateRange.end;
      });
    }
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Count orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
    
    // Find top products
    const productMap = new Map<string, { productName: string; quantity: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productMap.set(item.productId, {
            productName: item.productName,
            quantity: item.quantity,
          });
        }
      });
    });
    
    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    return {
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      ordersByStatus,
      topProducts,
    };
  }
}

export class CartService extends BaseFirestoreService<Cart> {
  constructor() {
    super(CARTS_COLLECTION);
  }

  // Get or create user cart
  async getUserCart(userId: string): Promise<Cart> {
    console.log('Getting cart for user:', userId);
    let cart = await this.getById(userId);
    
    if (!cart) {
      console.log('Cart not found, creating new cart for user:', userId);
      // Create new cart with userId as document ID
      await this.createWithId(userId, {
        userId,
        items: [],
        pricing: {
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          currency: 'INR',
        },
        lastModified: new Date(),
      });
      
      cart = await this.getById(userId);
      console.log('New cart created:', cart);
    }
    
    return cart!;
  }

  // Add item to cart
  async addToCart(userId: string, item: Omit<CartItem, 'id' | 'addedAt'>): Promise<void> {
    const cart = await this.getUserCart(userId);
    
    // Check if item already exists (same product, size, color)
    const existingItemIndex = cart.items.findIndex(cartItem => 
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      cartItem.color === item.color
    );
    
    let updatedItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        totalPrice: (updatedItems[existingItemIndex].quantity + item.quantity) * item.unitPrice,
      };
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `item_${Date.now()}`,
        totalPrice: item.quantity * item.unitPrice,
        addedAt: new Date(),
      };
      updatedItems = [...cart.items, newItem];
    }
    
    const pricing = calculateCartTotal(updatedItems);
    
    await this.update(userId, {
      items: updatedItems,
      pricing,
      lastModified: new Date(),
    });
  }

  // Update cart item quantity
  async updateCartItemQuantity(userId: string, itemId: string, newQuantity: number): Promise<void> {
    if (newQuantity <= 0) {
      await this.removeFromCart(userId, itemId);
      return;
    }
    
    const cart = await this.getUserCart(userId);
    const updatedItems = cart.items.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
        : item
    );
    
    const pricing = calculateCartTotal(updatedItems);
    
    await this.update(userId, {
      items: updatedItems,
      pricing,
      lastModified: new Date(),
    });
  }

  // Remove item from cart
  async removeFromCart(userId: string, itemId: string): Promise<void> {
    const cart = await this.getUserCart(userId);
    const updatedItems = cart.items.filter(item => item.id !== itemId);
    const pricing = calculateCartTotal(updatedItems);
    
    await this.update(userId, {
      items: updatedItems,
      pricing,
      lastModified: new Date(),
    });
  }

  // Clear cart
  async clearCart(userId: string): Promise<void> {
    await this.update(userId, {
      items: [],
      pricing: {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        currency: 'INR',
      },
      appliedCoupons: [],
      lastModified: new Date(),
    });
  }

  // Get cart item count
  async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.getUserCart(userId);
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}

// Export singleton instances
export const orderService = new OrderService();
export const cartService = new CartService();
