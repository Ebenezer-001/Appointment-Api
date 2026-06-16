import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Business } from './entities/business.entity';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { User } from '../users/entities/user.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from 'src/appointments/entities/appointments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, User, Staff, Service, Appointment]),
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, TypeOrmModule],
})
export class BusinessesModule {}
