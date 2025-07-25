
export type AppointmentStatus = 'booked' | 'completed' | 'cancelled';

export interface UserWithMinimalInfo {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMember extends UserWithMinimalInfo {
  position: string;
  isActive: boolean;
  isOnLeave: boolean;
}

// export interface AppointmentWithDetails extends PrismaAppointment {
//   user: UserWithMinimalInfo;
//   salon: PrismaSalon & {
//     salonStaff: Array<{
//       userId: string;
//       user: StaffMember;
//     }>;
//   };
//   service: PrismaService;
//   staff: (PrismaSalonStaff & { user: UserWithMinimalInfo }) | null;
//   reviews: any[];
//   productSales: any[];
//   startTime: string | Date;
//   endTime: string | Date;
//   notes?: string | null;
//   status: AppointmentStatus;
// }

export interface AppointmentDto {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  salonId: string;
  salonName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  salonId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  serviceId?: string;
  staffId?: string;
  date?: string;
  time?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AppointmentFilterOptions {
  salonId?: string;
  staffId?: string;
  customerId?: string;
  status?: AppointmentStatus;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

export interface StaffAvailability {
  staffId: string;
  staffName: string;
  slots: AvailabilitySlot[];
}

export interface ServiceAvailability {
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  staffAvailability: StaffAvailability[];
}
