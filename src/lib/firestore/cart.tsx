// src/lib/firestore/cart.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CartItem } from '@/types';

export const saveCartToFirestore = async (
  userId: string,
  cart: { items: CartItem[]; total: number }
) => {
  const ref = doc(db, 'carts', userId);
  await setDoc(ref, cart);
};

export const getCartFromFirestore = async (userId: string) => {
  const ref = doc(db, 'carts', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as { items: any[]; total: number };
  return null;
};

