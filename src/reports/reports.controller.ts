import { Controller, Get, UseGuards } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('business-admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardReport(@CurrentUser() user: CurrentUserPayload) {
    return this.reportsService.getBusinessDashboard(user.businessId);
  }
}
