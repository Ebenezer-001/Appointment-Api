import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { StaffServicesService } from './staff-services.service';
import { AssignServiceToStaffDto } from './dto/assign-service-to-staff.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_ADMIN)
export class StaffServicesController {
  constructor(private readonly staffServicesService: StaffServicesService) {}

  @Post('business-admin/staff-services')
  assignServiceToStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: AssignServiceToStaffDto,
  ) {
    return this.staffServicesService.assignServiceToStaff(user.businessId, dto);
  }

  @Get('business-admin/staff/:staffId/services')
  findServicesForStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
  ) {
    return this.staffServicesService.findServicesForStaff(
      user.businessId,
      staffId,
    );
  }

  @Get('business-admin/services/:serviceId/staff')
  findStaffForService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('serviceId') serviceId: string,
  ) {
    return this.staffServicesService.findStaffForService(
      user.businessId,
      serviceId,
    );
  }

  @Delete('business-admin/staff-services/:staffId/:serviceId')
  removeServiceFromStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.staffServicesService.removeServiceFromStaff(
      user.businessId,
      staffId,
      serviceId,
    );
  }
}
