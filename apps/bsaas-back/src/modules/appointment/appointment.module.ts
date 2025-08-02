import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
