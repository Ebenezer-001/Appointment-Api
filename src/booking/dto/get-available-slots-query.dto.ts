import { IsDateString, IsUUID } from 'class-validator';

export class GetAvailableSlotsQueryDto {
  @IsUUID()
  staffId: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: string;
}
