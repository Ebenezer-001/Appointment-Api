import { IsDateString, IsEmail } from 'class-validator';

export class ReschedulePublicAppointmentDto {
  @IsEmail()
  email: string;

  @IsDateString()
  startDateTime: string;
}
