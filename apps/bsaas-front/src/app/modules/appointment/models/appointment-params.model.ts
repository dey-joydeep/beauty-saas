import { AppointmentStatus } from './appointment.model';

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
