// Keep frontend enums in sync with backend and DB
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NOSHOW = 'noshow',
}

export enum SalonStaffRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum SalonStaffRequestType {
  PROFILE_UPDATE = 'profile_update',
  LEAVE = 'leave',
}
