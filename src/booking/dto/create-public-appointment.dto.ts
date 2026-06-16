import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePublicAppointmentDto {
  @IsUUID()
  staffId: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  startDateTime: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;
}
