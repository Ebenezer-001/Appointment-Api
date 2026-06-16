import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Business } from '../businesses/entities/business.entity';
import { Service } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffService } from '../staff-services/entities/staff-service.entity';
import { Availability } from '../availability/entities/availability.entity';
import { UnavailablePeriod } from '../unavailable-periods/entities/unavailable-period.entity';
import { Appointment } from '../appointments/entities/appointments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Service,
      Staff,
      StaffService,
      Availability,
      UnavailablePeriod,
      Appointment,
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
