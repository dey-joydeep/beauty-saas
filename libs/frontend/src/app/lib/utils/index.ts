/*
 * Shared utility functions
 */

/**
 * Format a date to a human-readable string
 * @param date Date or timestamp to format
 * @param options Intl.DateTimeFormatOptions to customize the output
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date;

    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Debounce a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate a unique ID
 * @param length Length of the ID (default: 16)
 * @returns A unique ID string
 */
export function generateId(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    if (typeof window !== 'undefined' && window.crypto) {
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            result += chars[values[i] % chars.length];
        }
    } else {
        // Fallback for non-browser environments
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }

    return result;
}

/**
 * Check if the current environment is a browser
 * @returns boolean indicating if running in a browser
 */
export const isBrowser = (): boolean => {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

/**
 * Check if the current environment is a server
 * @returns boolean indicating if running on a server
 */
export const isServer = (): boolean => {
    return !isBrowser();
};

// Add more utility functions as needed
