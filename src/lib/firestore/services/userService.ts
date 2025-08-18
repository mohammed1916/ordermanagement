// User service for handling user-related Firestore operations
import { query, where, orderBy, limit } from 'firebase/firestore';
import { BaseFirestoreService } from './base';
import { 
  UserProfile, 
  CreateUserData, 
  UpdateUserData, 
  validateUserData,
  USERS_COLLECTION 
} from '../schemas/users';

export class UserService extends BaseFirestoreService<UserProfile> {
  constructor() {
    super(USERS_COLLECTION);
  }

  // Create a new user
  async createUser(userData: CreateUserData): Promise<string> {
    validateUserData(userData);
    
    // Check if user with this email already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    return await this.create({
      ...userData,
      isEmailVerified: false,
      preferences: {
        newsletter: true,
        smsNotifications: true,
        currency: 'INR',
        language: 'en',
      },
      addresses: [],
    });
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const q = query(
        this.getCollection(),
        where('email', '==', email),
        limit(1)
      );
      
      const users = await this.getAll([where('email', '==', email)]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Get user by Firebase Auth UID
  async getUserByUid(uid: string): Promise<UserProfile | null> {
    return await this.getById(uid);
  }

  // Update user profile
  async updateProfile(uid: string, updateData: UpdateUserData): Promise<void> {
    // Validate phone number if provided
    if (updateData.phoneNumber && !/^\+?[\d\s\-\(\)]{10,}$/.test(updateData.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    
    await this.update(uid, updateData);
  }

  // Add address to user
  async addAddress(uid: string, address: Omit<import('../schemas/users').Address, 'id'>): Promise<void> {
    const user = await this.getById(uid);
    if (!user) throw new Error('User not found');
    
    const newAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    
    const updatedAddresses = [...(user.addresses || []), newAddress];
    
    // If this is the first address or marked as default, make it default
    if (address.isDefault || updatedAddresses.length === 1) {
      updatedAddresses.forEach((addr, index) => {
        addr.isDefault = index === updatedAddresses.length - 1;
      });
    }
    
    await this.update(uid, { addresses: updatedAddresses });
  }

  // Update address
  async updateAddress(uid: string, addressId: string, addressUpdate: Partial<import('../schemas/users').Address>): Promise<void> {
    const user = await this.getById(uid);
    if (!user) throw new Error('User not found');
    
    const updatedAddresses = (user.addresses || []).map(addr => 
      addr.id === addressId ? { ...addr, ...addressUpdate } : addr
    );
    
    // If making this address default, remove default from others
    if (addressUpdate.isDefault) {
      updatedAddresses.forEach(addr => {
        addr.isDefault = addr.id === addressId;
      });
    }
    
    await this.update(uid, { addresses: updatedAddresses });
  }

  // Delete address
  async deleteAddress(uid: string, addressId: string): Promise<void> {
    const user = await this.getById(uid);
    if (!user) throw new Error('User not found');
    
    const updatedAddresses = (user.addresses || []).filter(addr => addr.id !== addressId);
    
    // If deleted address was default, make first remaining address default
    if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    
    await this.update(uid, { addresses: updatedAddresses });
  }

  // Get user's default address
  async getDefaultAddress(uid: string): Promise<import('../schemas/users').Address | null> {
    const user = await this.getById(uid);
    if (!user || !user.addresses) return null;
    
    return user.addresses.find(addr => addr.isDefault) || user.addresses[0] || null;
  }

  // Update user preferences
  async updatePreferences(uid: string, preferences: Partial<import('../schemas/users').UserPreferences>): Promise<void> {
    const user = await this.getById(uid);
    if (!user) throw new Error('User not found');
    
    const updatedPreferences: import('../schemas/users').UserPreferences = {
      newsletter: user.preferences?.newsletter ?? true,
      smsNotifications: user.preferences?.smsNotifications ?? true,
      currency: user.preferences?.currency ?? 'INR',
      language: user.preferences?.language ?? 'en',
      ...preferences,
    };
    
    await this.update(uid, { preferences: updatedPreferences });
  }

  // Mark email as verified
  async markEmailVerified(uid: string): Promise<void> {
    await this.update(uid, { isEmailVerified: true });
  }

  // Get admin users
  async getAdminUsers(): Promise<UserProfile[]> {
    return await this.getAll([
      where('isAdmin', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  }

  // Get recent users (for admin dashboard)
  async getRecentUsers(limitCount: number = 10): Promise<UserProfile[]> {
    return await this.getAll([
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ]);
  }

  // Search users by name or email (for admin)
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia for better search
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const allUsers = await this.getAll([orderBy('createdAt', 'desc')]);
    
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm)
    );
  }

  // Get user stats (for admin dashboard)
  async getUserStats(): Promise<{
    totalUsers: number;
    adminUsers: number;
    verifiedUsers: number;
    recentSignups: number; // Last 7 days
  }> {
    const allUsers = await this.getAll();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return {
      totalUsers: allUsers.length,
      adminUsers: allUsers.filter(user => user.isAdmin).length,
      verifiedUsers: allUsers.filter(user => user.isEmailVerified).length,
      recentSignups: allUsers.filter(user => {
        const createdAt = this.timestampToDate(user.createdAt);
        return createdAt > weekAgo;
      }).length,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
