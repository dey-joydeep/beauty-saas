/*
 * Shared constants
 */

// API related constants
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

export const API_BASE_URL = `${API_PREFIX}/${API_VERSION}`;

// Common HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// Common error messages
export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    PASSWORD_MISMATCH: 'Passwords do not match',
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NOT_FOUND: 'The requested resource was not found',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
} as const;

// Common date formats
export const DATE_FORMATS = {
    DATE: 'MMM d, yyyy',
    DATE_TIME: 'MMM d, yyyy h:mm a',
    TIME: 'h:mm a',
    ISO: 'yyyy-MM-dd',
} as const;

// Common validation patterns
export const VALIDATION_PATTERNS = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^\+?[0-9\s-()]+$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    ZIP_CODE: /^\d{5}(-\d{4})?$/,
} as const;

// Common pagination defaults
export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// Add more shared constants as needed
