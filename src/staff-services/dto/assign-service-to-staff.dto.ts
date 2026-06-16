import { IsUUID } from 'class-validator';

export class AssignServiceToStaffDto {
  @IsUUID()
  staffId: string;

  @IsUUID()
  serviceId: string;
}
