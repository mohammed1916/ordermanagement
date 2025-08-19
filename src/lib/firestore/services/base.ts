// Base service class with common CRUD operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BaseDocument } from '../schemas/base';

export abstract class BaseFirestoreService<T extends BaseDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Get collection reference
  protected getCollection() {
    return collection(db, this.collectionName);
  }

  // Get document reference
  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log(`Creating document in ${this.collectionName} collection:`, data);
      
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(this.getCollection(), docData);
      console.log(`Document created successfully in ${this.collectionName} with ID:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Create a new document with specific ID
  async createWithId(id: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      console.log(`Creating document in ${this.collectionName} collection with ID ${id}:`, data);
      
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = this.getDocRef(id);
      await setDoc(docRef, docData);
      console.log(`Document created successfully in ${this.collectionName} with ID:`, id);
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName} with ID ${id}:`, error);
      throw error;
    }
  }

  // Get document by ID
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, updateData);
    } catch (error: any) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      
      // Provide more specific error messages
      if (error?.code === 'permission-denied') {
        throw new Error(`Permission denied: You don't have access to update this ${this.collectionName.slice(0, -1)}.`);
      } else if (error?.code === 'not-found') {
        throw new Error(`${this.collectionName.slice(0, -1).charAt(0).toUpperCase() + this.collectionName.slice(1, -1)} not found.`);
      } else if (error?.code === 'unavailable') {
        throw new Error('Network error: Please check your internet connection and try again.');
      } else if (error?.code === 'unauthenticated') {
        throw new Error('Authentication required: Please log in again.');
      }
      
      throw error;
    }
  }

  // Delete document
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents with optional constraints
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = constraints.length > 0 
        ? query(this.getCollection(), ...constraints)
        : query(this.getCollection());
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Paginated query
  async getPaginated(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot,
    constraints: QueryConstraint[] = []
  ): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
    try {
      const queryConstraints = [
        ...constraints,
        limit(pageSize + 1) // Get one extra to check if there are more
      ];
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }
      
      const q = query(this.getCollection(), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageSize;
      
      // Remove the extra document if present
      if (hasMore) {
        docs.pop();
      }
      
      const data = docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      
      return {
        data,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
        hasMore,
      };
    } catch (error) {
      console.error(`Error getting paginated documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Count documents with optional constraints
  async count(constraints: QueryConstraint[] = []): Promise<number> {
    try {
      const q = query(this.getCollection(), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error(`Error counting documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Check if document exists
  async exists(id: string): Promise<boolean> {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking document existence in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Utility method to convert Firestore timestamp to Date
  protected timestampToDate(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }

  // Utility method to create query constraints
  protected createConstraints(filters: Record<string, any> = {}): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(field, '==', value));
      }
    });
    
    return constraints;
  }
}
