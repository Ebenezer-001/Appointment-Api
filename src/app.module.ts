import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { ServicesModule } from './services/services.module';
import { AvailabilityModule } from './availability/availability.module';
import { UnavailablePeriodsModule } from './unavailable-periods/unavailable-periods.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BookingModule } from './booking/booking.module';
import { ReportsModule } from './reports/reports.module';
// import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { StaffServicesModule } from './staff-services/staff-services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

      TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get<string>('DATABASE_URL'),
    autoLoadEntities: true,
    synchronize: true,
    ssl: {
      rejectUnauthorized: false,
    },
  }),
}),

    BusinessesModule,
    UsersModule,
    AuthModule,
    StaffModule,
    ServicesModule,
    StaffServicesModule,
    AvailabilityModule,
    UnavailablePeriodsModule,
    AppointmentsModule,
    BookingModule,
    ReportsModule,
    // AuditLogsModule,
  ],
})
export class AppModule {}
