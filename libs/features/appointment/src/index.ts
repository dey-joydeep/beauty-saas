// Module
export { AppointmentModule } from './lib/appointment.module';

// Export the module as default
export { AppointmentModule as default } from './lib/appointment.module';

// Export DTOs
export * from './lib/dto';
export * from './lib/dto/requests';
export * from './lib/dto/responses';

// Export services
export * from './lib/services';

// Export controllers
export * from './lib/controllers';

// Export models, interfaces and types
export * from './lib/models';

// Export constants and enums
export * from './lib/constants';

// Export types
export * from './lib/types';

// Re-export common types for convenience
export type { Appointment, AppointmentStatus } from '@prisma/client';
