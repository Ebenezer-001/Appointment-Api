import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
