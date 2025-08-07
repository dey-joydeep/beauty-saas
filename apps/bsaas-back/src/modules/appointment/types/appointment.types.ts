import { User } from '@prisma/client';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  IN_PROGRESS = 'IN_PROGRESS',
  BOOKED = 'BOOKED',
  // Add other statuses as needed
}

export interface UserWithMinimalInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Add other minimal user fields as needed
}

export interface StaffWithUser {
  id: string;
  userId: string;
  user: UserWithMinimalInfo;
  // Add other staff-specific fields as needed
}

export interface AppointmentWithRelations {
  id: string;
  // Add other appointment fields
  staff?: StaffWithUser;
  user?: UserWithMinimalInfo;
  status: AppointmentStatus;
  // Add other appointment fields as needed
}
