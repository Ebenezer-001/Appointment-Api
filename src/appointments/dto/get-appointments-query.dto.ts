import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class GetAppointmentsQueryDto {
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsUUID()
  @IsOptional()
  staffId?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
