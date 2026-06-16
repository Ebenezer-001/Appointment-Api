import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUnavailablePeriodDto {
  @IsUUID()
  staffId: string;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason?: string;
}
