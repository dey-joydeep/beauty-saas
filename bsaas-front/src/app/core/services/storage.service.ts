import { Injectable, Inject, Optional } from '@angular/core';
import { PlatformUtils } from '../utils/platform-utils';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage | null;
  private isReady = true; // Always ready when using localStorage

  constructor(@Optional() @Inject(PlatformUtils) private platformUtils?: PlatformUtils) {
    // Use PlatformUtils for SSR-safe localStorage access
    this.storage = this.platformUtils?.localStorage ?? (typeof window !== 'undefined' ? window.localStorage : null);
  }

  /**
   * Initialize the storage service
   */
  private ensureReady(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Wait for storage to be ready
   */
  // Initialize method removed as it's not needed with localStorage

  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to store
   * @returns Observable that completes when the value is set
   */
  setItem<T>(key: string, value: T): Observable<void> {
    return from(this.ensureReady()).pipe(
      map(() => {
        if (!this.storage) return;
        const serialized = JSON.stringify(value);
        this.storage.setItem(key, serialized);
      })
    );
  }

  /**
   * Get an item from storage
   * @param key The key to get
   * @returns Observable that emits the value or null if not found
   */
  getItem<T>(key: string): Observable<T | null> {
    return from(this.ensureReady()).pipe(
      map(() => {
        if (!this.storage) return null;
        const item = this.storage.getItem(key);
        return item ? JSON.parse(item) as T : null;
      })
    );
  }

  /**
   * Remove an item from storage
   * @param key The key to remove
   * @returns Observable that completes when the item is removed
   */
  removeItem(key: string): Observable<void> {
    return from(this.ensureReady()).pipe(
      map(() => {
        if (!this.storage) return;
        this.storage.removeItem(key);
      })
    );
  }

  /**
   * Clear all items from storage
   * @returns Observable that completes when storage is cleared
   */
  clear(): Observable<void> {
    return from(this.ensureReady()).pipe(
      map(() => {
        if (!this.storage) return;
        this.storage.clear();
      })
    );
  }

  /**
   * Get the number of items in storage
   * @returns Observable that emits the number of items
   */
  length(): Observable<number> {
    return from(this.ensureReady()).pipe(
      map(() => this.storage ? this.storage.length : 0)
    );
  }

  /**
   * Get all keys in storage
   * @returns Observable that emits an array of keys
   */
  keys(): Observable<string[]> {
    return from(this.ensureReady()).pipe(
      map(() => {
        const keys: string[] = [];
        if (!this.storage) return keys;
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key !== null) {
            keys.push(key);
          }
        }
        return keys;
      })
    );
  }

  // Synchronous methods for convenience (use with caution)

  /**
   * Set an item in storage synchronously
   * Note: Only use this after ensureReady() has resolved
   */
  setItemSync<T>(key: string, value: T): void {
    if (!this.storage) return;
    const serialized = JSON.stringify(value);
    this.storage.setItem(key, serialized);
  }

  /**
   * Get an item from storage synchronously
   * Note: Only use this after ensureReady() has resolved
   */
  getItemSync<T>(key: string): T | null {
    if (!this.storage) return null;
    const item = this.storage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  }

  /**
   * Remove an item from storage synchronously
   * Note: Only use this after ensureReady() has resolved
   */
  removeItemSync(key: string): void {
    if (!this.storage) return;
    this.storage.removeItem(key);
  }

  /**
   * Check if a key exists in storage
   * @param key The key to check
   * @returns Observable that emits true if the key exists
   */
  hasKey(key: string): Observable<boolean> {
    return from(this.ensureReady()).pipe(
      map(() => this.storage ? this.storage.getItem(key) !== null : false)
    );
  }

  /**
   * Get an item or set it if it doesn't exist
   * @param key The key to get or set
   * @param defaultValue The default value to set if the key doesn't exist
   * @returns Observable that emits the value
   */
  getOrSet<T>(key: string, defaultValue: T): Observable<T> {
    return this.getItem<T>(key).pipe(
      switchMap((value: T | null) => {
        if (value === null) {
          return this.setItem(key, defaultValue).pipe(
            map(() => defaultValue)
          );
        }
        return of(value);
      })
    );
  }
}
