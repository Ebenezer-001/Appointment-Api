import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UnavailablePeriod } from './entities/unavailable-period.entity';
import { Staff } from '../staff/entities/staff.entity';
import { UnavailablePeriodsController } from './unavailable-periods.controller';
import { UnavailablePeriodsService } from './unavailable-periods.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnavailablePeriod, Staff])],
  controllers: [UnavailablePeriodsController],
  providers: [UnavailablePeriodsService],
  exports: [UnavailablePeriodsService, TypeOrmModule],
})
export class UnavailablePeriodsModule {}
