// Base schema types and utilities for Firestore
import { Timestamp, FieldValue } from 'firebase/firestore';

// Base document interface that all Firestore documents should extend
export interface BaseDocument {
  id?: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

// Common field types
export interface TimestampFields {
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// Validation helpers
export const validateRequired = <T>(value: T | undefined | null, fieldName: string): T => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
  return value;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phoneNumber);
};
