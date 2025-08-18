// User collection schema
import { BaseDocument, TimestampFields } from './base';

export interface UserProfile extends BaseDocument {
  email: string;
  name: string;
  phoneNumber?: string;
  photoURL?: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  preferences?: UserPreferences;
  addresses?: Address[];
}

export interface UserPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  currency: 'USD' | 'EUR' | 'INR';
  language: 'en' | 'hi';
}

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// User creation data (what we store when creating a new user)
export interface CreateUserData extends Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> {
  uid: string; // Firebase Auth UID
}

// User update data (partial updates allowed)
export interface UpdateUserData extends Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>> {}

// Collection name constant
export const USERS_COLLECTION = 'users';

// Validation functions
export const validateUserData = (data: CreateUserData): void => {
  if (!data.email || !data.name || !data.uid) {
    throw new Error('Email, name, and uid are required for user creation');
  }
  
  if (!data.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  if (data.phoneNumber && !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phoneNumber)) {
    throw new Error('Invalid phone number format');
  }
};
