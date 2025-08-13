import { AppointmentStatus } from '@frontend-shared/shared/enums/appointment-status.enum';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number; // in minutes
  servicePrice: number;
  staffId: string;
  staffName: string;
  salonId: string;
  salonName: string;
  startTime: string | Date;
  endTime: string | Date;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
  cancellationDate?: string | Date;
  cancellationRequestedBy?: string;
  rescheduledFrom?: string; // Original appointment ID if this was rescheduled
  rescheduledTo?: string; // New appointment ID if this was rescheduled
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
  amountPaid: number;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  tipAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy?: string;
  metadata?: Record<string, any>;
}

export interface AppointmentListResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noshow: number;
  revenue: number;
  averageTicket: number;
  byService: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  byStaff: Array<{
    staffId: string;
    staffName: string;
    count: number;
    revenue: number;
  }>;
  byDate: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
}

export interface AppointmentCalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  allDay?: boolean;
  extendedProps: {
    status: AppointmentStatus;
    customerName: string;
    serviceName: string;
    staffName: string;
    notes?: string;
    customerPhone?: string;
    customerEmail?: string;
  };
  color?: string;
  textColor?: string;
  borderColor?: string;
  className?: string;
  backgroundColor?: string;
  display?: 'auto' | 'block' | 'list-item' | 'background' | 'inverse-background' | 'none';
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  type: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed';
  scheduledTime: string | Date;
  sentTime?: string | Date;
  recipient: string;
  subject?: string;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AppointmentNote {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  isInternal: boolean;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AppointmentChecklistItem {
  id: string;
  appointmentId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string | Date;
  completedBy?: string;
  sortOrder: number;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AppointmentFeedback {
  id: string;
  appointmentId: string;
  customerId: string;
  rating: number; // 1-5
  comment?: string;
  staffRating?: number; // 1-5
  serviceRating?: number; // 1-5
  facilityRating?: number; // 1-5
  isAnonymous: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string | Date;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}
