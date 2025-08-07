import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { AppointmentService } from './services/appointment.service';
import { AppointmentController } from './controllers/appointment.controller';

@Module({
  controllers: [AppointmentController],
  providers: [
    PrismaService,
    AppointmentService,
  ],
  exports: [AppointmentService],
})
export class AppointmentModule {}
