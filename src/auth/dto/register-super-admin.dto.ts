import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterSuperAdminDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
