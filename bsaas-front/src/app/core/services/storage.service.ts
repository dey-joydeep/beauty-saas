/**
 * Storage Service
 *
 * Provides a consistent API for storage operations with SSR support
 * and memory fallback when localStorage is not available.
 */
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, firstValueFrom } from 'rxjs';
import { IPlatformUtils, PLATFORM_UTILS_TOKEN } from '../utils/platform-utils';

/**
 * Service for handling storage operations in an SSR-compatible way
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage | null = null;
  private readonly platformUtils = inject(PLATFORM_UTILS_TOKEN, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean = isPlatformBrowser(this.platformId);
  private readonly memoryStore = new Map<string, string>();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize storage with SSR safety
   */
  private initialize(): void {
    if (this.storage !== null) return;

    try {
      if (this.platformUtils) {
        this.storage = this.platformUtils.browserLocalStorage;
      } else if (this.isBrowser && typeof window !== 'undefined') {
        this.storage = window.localStorage;
      } else {
        this.storage = this.createMemoryStorage();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Failed to initialize storage, using memory fallback:', errorMessage);
      this.storage = this.createMemoryStorage();
    }
  }

  /**
   * Create an in-memory storage fallback
   */
  private createMemoryStorage(): Storage {
    const memoryStore = this.memoryStore;
    return {
      getItem: (key: string): string | null => memoryStore.get(key) || null,
      setItem: (key: string, value: string): void => { memoryStore.set(key, value); },
      removeItem: (key: string): void => { memoryStore.delete(key); },
      clear: (): void => { memoryStore.clear(); },
      key: (index: number): string | null => Array.from(memoryStore.keys())[index] || null,
      get length(): number {
        return memoryStore.size;
      }
    } as Storage;
  }

  /**
   * Ensure storage is ready before operations
   */
  private async ensureReady(): Promise<void> {
    if (this.storage === null) {
      this.initialize();
    }
    return Promise.resolve();
  }

  /**
   * Get the number of items in storage
   * @returns The number of items in storage
   */
  get size(): number {
    if (!this.storage) return this.memoryStore.size;
    try {
      return this.storage.length;
    } catch (error) {
      console.warn('Error getting storage length:', error);
      return this.memoryStore.size;
    }
  }

  /**
   * Get the key at the specified index
   * @param index The index of the key to retrieve
   * @returns The key at the specified index or null if not found
   */
  key(index: number): string | null {
    if (!this.storage) return Array.from(this.memoryStore.keys())[index] || null;
    try {
      return this.storage.key(index);
    } catch (error) {
      console.warn('Error getting storage key:', error);
      return Array.from(this.memoryStore.keys())[index] || null;
    }
  }

  /**
   * Set an item in storage
   * @param key The key of the item to set
   * @param value The value to store (will be JSON stringified)
   * @returns Observable that completes when the value is set
   */
  setItem<T>(key: string, value: T): Observable<void> {
    return from(this.ensureReady().then(() => {
      try {
        const serialized = JSON.stringify(value);
        if (this.storage) {
          this.storage.setItem(key, serialized);
        } else {
          this.memoryStore.set(key, serialized);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error setting item, using memory fallback:', errorMessage);
        this.memoryStore.set(key, JSON.stringify(value));
      }
    }));
  }

  /**
   * Get an item from storage
   * @param key The key of the item to get
   * @returns Observable that emits the value or null if not found
   */
  getItem<T>(key: string): Observable<T | null> {
    return from(this.ensureReady().then(() => {
      try {
        const item = this.storage?.getItem(key) ?? this.memoryStore.get(key);
        return item ? JSON.parse(item) as T : null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error getting item, returning null:', errorMessage);
        return null;
      }
    }));
  }

  /**
   * Remove an item from storage
   * @param key The key of the item to remove
   * @returns Observable that completes when the item is removed
   */
  removeItem(key: string): Observable<void> {
    return from(this.ensureReady().then(() => {
      try {
        if (this.storage) {
          this.storage.removeItem(key);
        }
        this.memoryStore.delete(key);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error removing item, continuing:', errorMessage);
        this.memoryStore.delete(key);
      }
    }));
  }

  /**
   * Clear all items from storage
   * @returns Observable that completes when storage is cleared
   */
  clear(): Observable<void> {
    return from(this.ensureReady().then(() => {
      try {
        if (this.storage) {
          this.storage.clear();
        }
        this.memoryStore.clear();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error clearing storage, continuing with memory fallback:', errorMessage);
        this.memoryStore.clear();
      }
    }));
  }

  /**
   * Get the number of items in storage as an observable
   * @returns Observable that emits the number of items
   */
  getLength(): Observable<number> {
    return from(this.ensureReady().then(() => this.size));
  }

  /**
   * Get all keys in storage
   * @returns Observable that emits an array of keys
   */
  keys(): Observable<string[]> {
    return from(this.ensureReady().then(() => {
      const keys: string[] = [];
      
      // Get keys from memory store
      keys.push(...this.memoryStore.keys());
      
      // Get keys from storage if available
      if (this.storage) {
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key !== null && !keys.includes(key)) {
            keys.push(key);
          }
        }
      }
      
      return keys;
    }));
  }

  // Synchronous methods for convenience (use with caution)

  /**
   * Set an item in storage synchronously
   * Note: Only use this after ensureReady() has resolved
   */
  setItemSync<T>(key: string, value: T): void {
    if (!this.storage) {
      const serialized = JSON.stringify(value);
      this.memoryStore.set(key, serialized);
      return;
    }
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.warn('Error setting item synchronously, using memory fallback:', error);
      const serialized = JSON.stringify(value);
      this.memoryStore.set(key, serialized);
    }
  }

  /**
   * Get an item from storage synchronously
   * Note: Only use this after ensureReady() has resolved
   */
  getItemSync<T>(key: string): T | null {
    try {
      const item = this.storage?.getItem(key) ?? this.memoryStore.get(key) ?? null;
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.warn('Error getting item synchronously:', error);
      return null;
    }
  }

  /**
   * Remove an item from storage synchronously
   * Note: Only use this after ensureReady() has resolved
   */
  removeItemSync(key: string): void {
    if (this.storage) {
      try {
        this.storage.removeItem(key);
      } catch (error) {
        console.warn('Error removing item synchronously, using memory fallback:', error);
        this.memoryStore.delete(key);
      }
    } else {
      this.memoryStore.delete(key);
    }
  }

  /**
   * Check if a key exists in storage
   * @param key The key to check
   * @returns Observable that emits true if the key exists
   */
  hasKey(key: string): Observable<boolean> {
    return from(this.ensureReady().then(() => {
      if (this.storage) {
        try {
          return this.storage.getItem(key) !== null;
        } catch {
          return this.memoryStore.has(key);
        }
      }
      return this.memoryStore.has(key);
    }));
  }

  /**
   * Get an item from storage, or set it to a default value if it doesn't exist
   * @param key The key of the item to get or set
   * @param defaultValue The default value to set if the item doesn't exist
   * @returns Observable that emits the value
   */
  getOrSet<T>(key: string, defaultValue: T): Observable<T> {
    return from(this.ensureReady().then(async (): Promise<T> => {
      try {
        const value = await firstValueFrom(this.getItem<T>(key));
        if (value === null) {
          await firstValueFrom(this.setItem(key, defaultValue));
          return defaultValue;
        }
        return value;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error in getOrSet, using default value:', errorMessage);
        await firstValueFrom(this.setItem(key, defaultValue));
        return defaultValue;
      }
    }));
  }
}
