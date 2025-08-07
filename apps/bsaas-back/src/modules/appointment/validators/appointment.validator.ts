import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma/prisma.service';

@ValidatorConstraint({ name: 'isValidAppointmentStatus', async: true })
@Injectable()
export class IsValidAppointmentStatusConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(value: string): Promise<boolean> {
    if (!value) return false;
    
    // Define valid status values
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ];

    return validStatuses.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `Invalid appointment status. Valid statuses are: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW`;
  }
}

export function IsValidAppointmentStatus(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAppointmentStatusConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isValidAppointmentTime', async: false })
export class IsValidAppointmentTimeConstraint implements ValidatorConstraintInterface {
  validate(value: Date): boolean {
    if (!value) return false;
    
    // Ensure the appointment is not in the past
    const now = new Date();
    return new Date(value) >= now;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Appointment time must be in the future';
  }
}

export function IsValidAppointmentTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAppointmentTimeConstraint,
    });
  };
}
