import log4js from 'log4js';

// Configure log4js
log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: {
            type: 'file',
            filename: 'logs/app.log',
            maxLogSize: 10485760, // 10MB
            backups: 5,
            compress: true
        }
    },
    categories: {
        default: {
            appenders: ['console', 'file'],
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }
    },
    pm2: process.env.NODE_ENV === 'production'
});

// Default logger instance
export const logger = log4js.getLogger('default');

/**
 * Get a logger instance for a specific module/component
 * @param name - The name of the module/component
 * @returns A logger instance
 */
export function getLogger(name: string) {
    return log4js.getLogger(name);
}

// Add a shutdown hook to flush logs when the process exits
process.on('SIGINT', () => {
    log4js.shutdown(() => process.exit(0));
});
