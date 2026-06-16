import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Staff } from '../staff/entities/staff.entity';
import { Service } from '../services/entities/service.entity';
import { StaffService } from '../staff-services/entities/staff-service.entity';
import { Availability } from '../availability/entities/availability.entity';
import { UnavailablePeriod } from '../unavailable-periods/entities/unavailable-period.entity';
import { Appointment } from './entities/appointments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Staff,
      Service,
      StaffService,
      Availability,
      UnavailablePeriod,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
