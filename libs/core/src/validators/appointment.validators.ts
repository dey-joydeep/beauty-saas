import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { AppointmentStatus } from '@beauty-saas/shared';

/**
 * Validates that the appointment status is valid
 */
export function IsValidAppointmentStatus(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidAppointmentStatus',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {
        message: 'Invalid appointment status',
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && Object.values(AppointmentStatus).includes(value as AppointmentStatus);
        },
      },
    });
  };
}

/**
 * Validates that the appointment time is in the future
 */
export function IsValidAppointmentTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidAppointmentTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {
        message: 'Appointment time must be in the future',
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value === 'string') {
            const appointmentTime = new Date(value);
            const now = new Date();
            return !isNaN(appointmentTime.getTime()) && appointmentTime > now;
          }
          return false;
        },
      },
    });
  };
}
