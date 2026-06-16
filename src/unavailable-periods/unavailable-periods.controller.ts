import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UnavailablePeriodsService } from './unavailable-periods.service';
import { CreateUnavailablePeriodDto } from './dto/create-unavailable-period.dto';
import { UpdateUnavailablePeriodDto } from './dto/update-unavailable-period.dto';
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
export class UnavailablePeriodsController {
  constructor(
    private readonly unavailablePeriodsService: UnavailablePeriodsService,
  ) {}

  @Post('business-admin/unavailable-periods')
  createUnavailablePeriod(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateUnavailablePeriodDto,
  ) {
    return this.unavailablePeriodsService.createForBusiness(
      user.businessId,
      dto,
    );
  }

  @Get('business-admin/unavailable-periods')
  findAllUnavailablePeriods(@CurrentUser() user: CurrentUserPayload) {
    return this.unavailablePeriodsService.findAllForBusiness(user.businessId);
  }

  @Get('business-admin/staff/:staffId/unavailable-periods')
  findStaffUnavailablePeriods(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
  ) {
    return this.unavailablePeriodsService.findForStaff(
      user.businessId,
      staffId,
    );
  }

  @Patch('business-admin/unavailable-periods/:unavailablePeriodId')
  updateUnavailablePeriod(
    @CurrentUser() user: CurrentUserPayload,
    @Param('unavailablePeriodId') unavailablePeriodId: string,
    @Body() dto: UpdateUnavailablePeriodDto,
  ) {
    return this.unavailablePeriodsService.updateForBusiness(
      user.businessId,
      unavailablePeriodId,
      dto,
    );
  }

  @Delete('business-admin/unavailable-periods/:unavailablePeriodId')
  deleteUnavailablePeriod(
    @CurrentUser() user: CurrentUserPayload,
    @Param('unavailablePeriodId') unavailablePeriodId: string,
  ) {
    return this.unavailablePeriodsService.deleteForBusiness(
      user.businessId,
      unavailablePeriodId,
    );
  }
}
