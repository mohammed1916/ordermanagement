import React from 'react';
import { Step } from '@/types';
import { CartItem } from '@/types';

// Order Summary Component
export const OrderSummary: React.FC<{
    cart: { items: CartItem[] };
    formatPrice: (price: number) => string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}> = ({ cart, formatPrice, subtotal, shipping, tax, total }) => {
    return (
        <div className="bg-gray-50 rounded-md p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                        <div>
                            <p>{item.product.name} <span className="text-gray-500">× {item.quantity}</span></p>
                        </div>
                        <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};