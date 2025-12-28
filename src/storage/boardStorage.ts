/**
 * Board storage implementation with IndexedDB primary and localStorage fallback.
 * 
 * This module provides persistent storage for game boards using:
 * 1. IndexedDB (preferred) - for better performance and larger storage capacity
 * 2. localStorage (fallback) - for browsers without IndexedDB support
 */

import type { BoardStorage, SavedBoard, SaveBoardInput, UpdateBoardInput } from '../types/storage';
import { STORAGE_CONFIG } from '../types/storage';
import { generateUUID } from '../utils/uuid';

/**
 * Check if IndexedDB is available in the current environment.
 */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Open the IndexedDB database, creating the object store if needed.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_CONFIG.dbName, STORAGE_CONFIG.dbVersion);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORAGE_CONFIG.storeName)) {
        const store = db.createObjectStore(STORAGE_CONFIG.storeName, { keyPath: 'id' });
        // Create index for sorting by updatedAt
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * IndexedDB implementation of BoardStorage.
 */
class IndexedDBStorage implements BoardStorage {
  async save(board: SaveBoardInput): Promise<SavedBoard> {
    const db = await openDatabase();
    const now = Date.now();
    
    const savedBoard: SavedBoard = {
      id: generateUUID(),
      name: board.name,
      grid: board.grid,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORAGE_CONFIG.storeName, 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.storeName);
      const request = store.add(savedBoard);

      request.onerror = () => reject(new Error('Failed to save board'));
      request.onsuccess = () => resolve(savedBoard);
      
      transaction.oncomplete = () => db.close();
    });
  }

  async load(id: string): Promise<SavedBoard | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORAGE_CONFIG.storeName, 'readonly');
      const store = transaction.objectStore(STORAGE_CONFIG.storeName);
      const request = store.get(id);

      request.onerror = () => reject(new Error('Failed to load board'));
      request.onsuccess = () => resolve(request.result || null);
      
      transaction.oncomplete = () => db.close();
    });
  }

  async list(): Promise<SavedBoard[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORAGE_CONFIG.storeName, 'readonly');
      const store = transaction.objectStore(STORAGE_CONFIG.storeName);
      const request = store.getAll();

      request.onerror = () => reject(new Error('Failed to list boards'));
      request.onsuccess = () => {
        // Sort by updatedAt descending
        const boards = request.result as SavedBoard[];
        boards.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(boards);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }

  async delete(id: string): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORAGE_CONFIG.storeName, 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(new Error('Failed to delete board'));
      request.onsuccess = () => resolve();
      
      transaction.oncomplete = () => db.close();
    });
  }

  async update(id: string, updates: UpdateBoardInput): Promise<SavedBoard> {
    const db = await openDatabase();
    const existing = await this.load(id);

    if (!existing) {
      throw new Error(`Board with id ${id} not found`);
    }

    const updatedBoard: SavedBoard = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORAGE_CONFIG.storeName, 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.storeName);
      const request = store.put(updatedBoard);

      request.onerror = () => reject(new Error('Failed to update board'));
      request.onsuccess = () => resolve(updatedBoard);
      
      transaction.oncomplete = () => db.close();
    });
  }
}

// ============================================================================
// localStorage Fallback Implementation
// ============================================================================

/**
 * localStorage fallback implementation of BoardStorage.
 * Used when IndexedDB is not available.
 */
class LocalStorageFallback implements BoardStorage {
  private getBoards(): SavedBoard[] {
    try {
      const data = localStorage.getItem(STORAGE_CONFIG.localStorageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setBoards(boards: SavedBoard[]): void {
    localStorage.setItem(STORAGE_CONFIG.localStorageKey, JSON.stringify(boards));
  }

  async save(board: SaveBoardInput): Promise<SavedBoard> {
    const boards = this.getBoards();
    const now = Date.now();

    const savedBoard: SavedBoard = {
      id: generateUUID(),
      name: board.name,
      grid: board.grid,
      createdAt: now,
      updatedAt: now,
    };

    boards.push(savedBoard);
    this.setBoards(boards);
    return savedBoard;
  }

  async load(id: string): Promise<SavedBoard | null> {
    const boards = this.getBoards();
    return boards.find(b => b.id === id) || null;
  }

  async list(): Promise<SavedBoard[]> {
    const boards = this.getBoards();
    // Sort by updatedAt descending
    return boards.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async delete(id: string): Promise<void> {
    const boards = this.getBoards();
    const filtered = boards.filter(b => b.id !== id);
    this.setBoards(filtered);
  }

  async update(id: string, updates: UpdateBoardInput): Promise<SavedBoard> {
    const boards = this.getBoards();
    const index = boards.findIndex(b => b.id === id);

    if (index === -1) {
      throw new Error(`Board with id ${id} not found`);
    }

    const updatedBoard: SavedBoard = {
      ...boards[index],
      ...updates,
      updatedAt: Date.now(),
    };

    boards[index] = updatedBoard;
    this.setBoards(boards);
    return updatedBoard;
  }
}

// ============================================================================
// Storage Factory
// ============================================================================

/**
 * Create a BoardStorage instance using IndexedDB or localStorage fallback.
 */
function createBoardStorage(): BoardStorage {
  if (isIndexedDBAvailable()) {
    return new IndexedDBStorage();
  }
  console.warn('IndexedDB not available, falling back to localStorage');
  return new LocalStorageFallback();
}

/**
 * Singleton storage instance.
 */
export const boardStorage = createBoardStorage();

/**
 * Export for testing purposes.
 */
export { IndexedDBStorage, LocalStorageFallback, isIndexedDBAvailable };
