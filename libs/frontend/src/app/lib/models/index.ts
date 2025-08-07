/*
 * Shared models and interfaces
 */

// User-related interfaces
export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

// Role types
export type UserRole = 'admin' | 'owner' | 'staff' | 'customer';

// Common response wrapper
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

// Pagination interfaces
export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMeta;
}

// Common entity interfaces
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Add more shared models as needed
