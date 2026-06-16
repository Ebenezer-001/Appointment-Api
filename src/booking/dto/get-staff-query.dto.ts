import { IsOptional, IsUUID } from 'class-validator';

export class GetStaffQueryDto {
  @IsUUID()
  @IsOptional()
  serviceId?: string;
}
