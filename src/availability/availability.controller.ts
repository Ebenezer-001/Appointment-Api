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

import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
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
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('business-admin/availability')
  createAvailability(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createForBusiness(user.businessId, dto);
  }

  @Get('business-admin/availability')
  findAllAvailability(@CurrentUser() user: CurrentUserPayload) {
    return this.availabilityService.findAllForBusiness(user.businessId);
  }

  @Get('business-admin/staff/:staffId/availability')
  findStaffAvailability(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
  ) {
    return this.availabilityService.findForStaff(user.businessId, staffId);
  }

  @Patch('business-admin/availability/:availabilityId')
  updateAvailability(
    @CurrentUser() user: CurrentUserPayload,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateForBusiness(
      user.businessId,
      availabilityId,
      dto,
    );
  }

  @Delete('business-admin/availability/:availabilityId')
  deleteAvailability(
    @CurrentUser() user: CurrentUserPayload,
    @Param('availabilityId') availabilityId: string,
  ) {
    return this.availabilityService.deleteForBusiness(
      user.businessId,
      availabilityId,
    );
  }
}
