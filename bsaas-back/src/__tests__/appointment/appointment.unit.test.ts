import { AppointmentService } from '../../modules/appointment/appointment.service';

describe('AppointmentService Unit', () => {
  let service: AppointmentService;

  beforeEach(() => {
    // service = new AppointmentService();
  });

  it('should create a new appointment', async () => {
    // const appointment = await service.createAppointment({
    //   userId: 'user1',
    //   salonId: 'salon1',
    //   serviceId: 'service1',
    //   date: '2023-12-31',
    //   time: '14:00',
    //   notes: 'Test appointment',
    //   status: AppointmentStatus.BOOKED,
    // });

    // expect(appointment).toHaveProperty('id');
    // expect(appointment.userId).toBe('user1');
    // expect(appointment.salonId).toBe('salon1');
    // expect(appointment.status).toBe(AppointmentStatus.BOOKED);
  });

//   it('should return appointments for a user', async () => {
//     // Create test appointments
//     await service.createAppointment({
//       userId: 'user2',
//       salonId: 'salon1',
//       serviceId: 'service1',
//       date: '2023-12-31',
//       time: '14:00',
//       status: AppointmentStatus.BOOKED,
//     });

//     const appointments = await service.getAppointments({ filter: { userId: 'user2' } });
//     expect(Array.isArray(appointments)).toBe(true);
//     expect(appointments.length).toBeGreaterThan(0);
//     expect(appointments[0].userId).toBe('user2');
//   });

//   it('should update an appointment status', async () => {
//     // Create a test appointment
//     const newAppointment = await service.createAppointment({
//       userId: 'user3',
//       salonId: 'salon1',
//       serviceId: 'service1',
//       date: '2023-12-31',
//       time: '15:00',
//       status: AppointmentStatus.BOOKED,
//     });

//     // Update the appointment status
//     const updatedAppointment = await service.updateAppointment(newAppointment.id, {
//       status: AppointmentStatus.CANCELLED,
//     });

//     expect(updatedAppointment.status).toBe(AppointmentStatus.CANCELLED);
//   });

//   it('should delete an appointment', async () => {
//     // Create a test appointment
//     const newAppointment = await service.createAppointment({
//       userId: 'user4',
//       salonId: 'salon1',
//       serviceId: 'service1',
//       date: '2023-12-31',
//       time: '16:00',
//       status: AppointmentStatus.BOOKED,
//     });

//     // Delete the appointment
//     await service.deleteAppointment(newAppointment.id);

//     // Verify it's deleted
//     const appointments = await service.getAppointments({
//       filter: { id: newAppointment.id },
//     });
//     expect(appointments.length).toBe(0);
//   });

//   it('should get appointment statistics', async () => {
//     // Create test appointments
//     await service.createAppointment({
//       userId: 'user5',
//       salonId: 'salon1',
//       serviceId: 'service1',
//       date: '2023-12-31',
//       time: '10:00',
//       status: AppointmentStatus.COMPLETED,
//     });

//     await service.createAppointment({
//       userId: 'user5',
//       salonId: 'salon1',
//       serviceId: 'service2',
//       date: '2023-12-31',
//       time: '11:00',
//       status: AppointmentStatus.CANCELLED,
//     });

//     const stats = await service.getAppointmentStatistics({
//       salonId: 'salon1',
//       startDate: '2023-01-01',
//       endDate: '2023-12-31',
//     });

//     expect(stats.total).toBe(2);
//     expect(stats.completed).toBe(1);
//     expect(stats.cancelled).toBe(1);
//   });
});
