import { orderService } from './services';
import { Order, CartItem, Address } from './schemas';

export interface Delivery {
    userId: string;
    items: CartItem[];
    shippingAddress: Address;
    phoneNumber: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    createdAt: any;
}

// Legacy function - now creates an order instead of delivery
export const createDelivery = async (delivery: Omit<Delivery, 'createdAt'>) => {
    try {
        // Convert delivery to order format
        const orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
            userId: delivery.userId,
            customerInfo: {
                name: delivery.shippingAddress.fullName,
                email: '', // Will need to be provided
                phoneNumber: delivery.phoneNumber,
            },
            items: delivery.items.map(item => ({
                id: `item_${Date.now()}_${Math.random()}`,
                productId: item.productId || '',
                productName: item.productName || '',
                productSku: item.productSku || '',
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                productImage: item.productImage,
                productSlug: '',
            })),
            status: delivery.status as any,
            shippingAddress: delivery.shippingAddress,
            paymentInfo: {
                method: 'cash_on_delivery',
                amount: delivery.total,
                currency: 'INR',
                status: 'pending',
            },
            pricing: {
                subtotal: delivery.subtotal,
                discount: 0,
                shipping: delivery.shipping,
                tax: delivery.tax,
                total: delivery.total,
                currency: 'INR',
            },
            shipping: {
                method: 'standard',
                cost: delivery.shipping,
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
            timeline: [],
            isGuestOrder: false,
        };

        return await orderService.createOrder(orderData);
    } catch (error) {
        console.error('Error creating delivery:', error);
        throw error;
    }
}; 