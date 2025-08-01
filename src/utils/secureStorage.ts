/**
 * Secure Storage Utility
 * Provides secure storage patterns and prevents storing sensitive data in localStorage
 */

// List of sensitive data patterns that should never be stored in localStorage
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /auth/i,
  /credential/i,
  /private[_-]?key/i,
  /session[_-]?id/i
];

// Maximum storage size for each item (in characters)
const MAX_ITEM_SIZE = 50000; // ~50KB

// Storage keys that are allowed (whitelist approach)
const ALLOWED_STORAGE_KEYS = [
  'aura-theme',
  'aura-design',
  'user-preferences',
  'ui-settings',
  'language',
  'timezone',
  'feature-flags',
  'tutorial-progress',
  'draft-content',
  'design-studio-projects'
];

interface StorageItem {
  value: any;
  timestamp: number;
  version: string;
  checksum?: string;
}

class SecureStorage {
  private static instance: SecureStorage;
  private readonly storageVersion = '1.0.0';

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Safely store data in localStorage with validation
   */
  setItem(key: string, value: any): boolean {
    try {
      // Validate key
      if (!this.isAllowedKey(key)) {
        console.warn(`Storage key "${key}" is not in the allowed list`);
        return false;
      }

      // Check for sensitive data
      if (this.containsSensitiveData(key, value)) {
        console.error(`Attempted to store sensitive data with key "${key}"`);
        return false;
      }

      // Prepare storage item
      const storageItem: StorageItem = {
        value: value,
        timestamp: Date.now(),
        version: this.storageVersion
      };

      const serialized = JSON.stringify(storageItem);

      // Check size
      if (serialized.length > MAX_ITEM_SIZE) {
        console.warn(`Storage item "${key}" exceeds maximum size`);
        return false;
      }

      // Store with prefix for easy identification
      localStorage.setItem(`secure_${key}`, serialized);
      
      // Log storage event (non-sensitive keys only)
      this.logStorageEvent('set', key, serialized.length);
      
      return true;
    } catch (error) {
      console.error(`Failed to store item "${key}":`, error);
      return false;
    }
  }

  /**
   * Safely retrieve data from localStorage
   */
  getItem<T = any>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`secure_${key}`);
      
      if (!stored) {
        return null;
      }

      const storageItem: StorageItem = JSON.parse(stored);

      // Version check
      if (storageItem.version !== this.storageVersion) {
        console.warn(`Storage version mismatch for "${key}". Removing outdated item.`);
        this.removeItem(key);
        return null;
      }

      // Log retrieval event
      this.logStorageEvent('get', key, stored.length);

      return storageItem.value as T;
    } catch (error) {
      console.error(`Failed to retrieve item "${key}":`, error);
      // Remove corrupted item
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(`secure_${key}`);
      this.logStorageEvent('remove', key, 0);
      return true;
    } catch (error) {
      console.error(`Failed to remove item "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(`secure_${key}`) !== null;
  }

  /**
   * Clear all secure storage items
   */
  clear(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => this.removeItem(key));
      this.logStorageEvent('clear', 'all', 0);
      return true;
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      return false;
    }
  }

  /**
   * Get all secure storage keys
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('secure_')) {
        keys.push(key.replace('secure_', ''));
      }
    }
    
    return keys;
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    totalItems: number;
    totalSize: number;
    items: Array<{ key: string; size: number; timestamp: number }>;
  } {
    const keys = this.getAllKeys();
    const items: Array<{ key: string; size: number; timestamp: number }> = [];
    let totalSize = 0;

    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(`secure_${key}`);
        if (stored) {
          const size = stored.length;
          totalSize += size;
          
          const storageItem: StorageItem = JSON.parse(stored);
          items.push({
            key,
            size,
            timestamp: storageItem.timestamp
          });
        }
      } catch (error) {
        console.warn(`Failed to get stats for "${key}":`, error);
      }
    });

    return {
      totalItems: keys.length,
      totalSize,
      items: items.sort((a, b) => b.size - a.size)
    };
  }

  /**
   * Cleanup old storage items
   */
  cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): number { // Default 30 days
    const cutoffTime = Date.now() - maxAge;
    let removedCount = 0;

    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(`secure_${key}`);
        if (stored) {
          const storageItem: StorageItem = JSON.parse(stored);
          
          if (storageItem.timestamp < cutoffTime) {
            this.removeItem(key);
            removedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted items
        this.removeItem(key);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.logStorageEvent('cleanup', `${removedCount}_items`, 0);
    }

    return removedCount;
  }

  /**
   * Check if a key is in the allowed list
   */
  private isAllowedKey(key: string): boolean {
    return ALLOWED_STORAGE_KEYS.includes(key) || 
           ALLOWED_STORAGE_KEYS.some(allowedKey => key.startsWith(allowedKey + '-'));
  }

  /**
   * Check if data contains sensitive information
   */
  private containsSensitiveData(key: string, value: any): boolean {
    // Check key against sensitive patterns
    if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
      return true;
    }

    // Check value content
    const valueString = JSON.stringify(value).toLowerCase();
    
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(valueString));
  }

  /**
   * Log storage events for monitoring
   */
  private logStorageEvent(action: string, key: string, size: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`SecureStorage ${action}:`, { key, size, timestamp: Date.now() });
    }
  }

  /**
   * Migrate legacy localStorage items to secure storage
   */
  migrateLegacyItems(): number {
    let migratedCount = 0;
    const legacyKeys = ['aura-theme', 'aura-design'];

    legacyKeys.forEach(key => {
      try {
        const legacyValue = localStorage.getItem(key);
        if (legacyValue && !this.hasItem(key)) {
          // Parse and validate legacy data
          const parsed = JSON.parse(legacyValue);
          
          if (this.setItem(key, parsed)) {
            // Remove legacy item after successful migration
            localStorage.removeItem(key);
            migratedCount++;
          }
        }
      } catch (error) {
        console.warn(`Failed to migrate legacy item "${key}":`, error);
        // Remove corrupted legacy item
        localStorage.removeItem(key);
      }
    });

    if (migratedCount > 0) {
      this.logStorageEvent('migration', `${migratedCount}_items`, 0);
    }

    return migratedCount;
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Legacy localStorage wrapper for gradual migration
export const legacyStorageWrapper = {
  getItem: (key: string) => {
    // First try secure storage
    let value = secureStorage.getItem(key);
    
    // If not found and it's an allowed key, try legacy localStorage
    if (value === null && ALLOWED_STORAGE_KEYS.includes(key)) {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue) {
        try {
          value = JSON.parse(legacyValue);
          // Migrate to secure storage
          secureStorage.setItem(key, value);
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to parse legacy item "${key}":`, error);
        }
      }
    }
    
    return value;
  },

  setItem: (key: string, value: any) => {
    return secureStorage.setItem(key, value);
  },

  removeItem: (key: string) => {
    return secureStorage.removeItem(key);
  }
};

// Export default
export default secureStorage;