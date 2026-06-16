import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Staff } from '../staff/entities/staff.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from 'src/appointments/entities/appointments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Staff, Service])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
