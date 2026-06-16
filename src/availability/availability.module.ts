import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Availability } from './entities/availability.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Staff])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService, TypeOrmModule],
})
export class AvailabilityModule {}
