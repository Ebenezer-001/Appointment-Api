import { IsEnum } from 'class-validator';
import { BusinessStatus } from '../../common/enums/business-status.enum';

export class UpdateBusinessStatusDto {
  @IsEnum(BusinessStatus)
  status: BusinessStatus;
}
