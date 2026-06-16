import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  startDateTime: string;

  @IsUUID()
  @IsOptional()
  staffId?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;
}
