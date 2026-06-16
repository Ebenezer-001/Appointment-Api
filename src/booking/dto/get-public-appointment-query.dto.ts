import { IsEmail } from 'class-validator';

export class GetPublicAppointmentQueryDto {
  @IsEmail()
  email: string;
}
