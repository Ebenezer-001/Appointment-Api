import { IsEmail } from 'class-validator';

export class CancelPublicAppointmentDto {
  @IsEmail()
  email: string;
}
