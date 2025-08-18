import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CartItem, Address } from '@/types';

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

export const createDelivery = async (delivery: Omit<Delivery, 'createdAt'>) => {
    try {
        const deliveriesRef = collection(db, 'deliveries');
        const docRef = await addDoc(deliveriesRef, {
            ...delivery,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating delivery:', error);
        throw error;
    }
}; 