export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    sizes: string[];
    colors: { class: string; name: string }[];
    category: string[];
    inStock: boolean;
    quantity?: number;
    countAvailable?: number;
  }
  
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  photoURL?: string | null;
  phoneNumber?: string | null;
}


  
  export interface Order {
    id: string;
    userId: string;
    products: CartItem[];
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: Address;
    paymentMethod: string;
    total: number;
    createdAt: string;
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
    size: string;
    color: string;
  }
  
  export interface Address {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }

  export type Step = 'phone' | 'shipping' | 'payment' | 'review';

  // Checkout form interface
  export interface CheckoutForm {
      phoneNumber: string;
      otpCode?: string;
      shippingAddress: Address;
      paymentMethod: 'credit-card' | 'phonepe';
      cardNumber: string;
      cardExpiry: string;
      cardCvc: string;
      saveInfo: boolean;
  }
  