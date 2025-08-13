import { AppointmentStatus } from '@frontend-shared/shared/enums/appointment-status.enum';

export interface CreateAppointmentParams {
  customerId: string;
  salonId: string;
  serviceId: string;
  staffId?: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  notes?: string;
}
