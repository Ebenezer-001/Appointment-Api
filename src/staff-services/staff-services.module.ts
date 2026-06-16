import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaffService } from './entities/staff-service.entity';
import { StaffServicesService } from './staff-services.service';
import { StaffServicesController } from './staff-services.controller';
import { Staff } from '../staff/entities/staff.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffService, Staff, Service])],
  controllers: [StaffServicesController],
  providers: [StaffServicesService],
  exports: [StaffServicesService, TypeOrmModule],
})
export class StaffServicesModule {}
