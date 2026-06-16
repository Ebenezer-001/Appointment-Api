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

import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('business-admin/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_ADMIN)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  createStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateStaffDto,
  ) {
    return this.staffService.createForBusiness(user.businessId, dto);
  }

  @Get()
  findAllStaff(@CurrentUser() user: CurrentUserPayload) {
    return this.staffService.findAllForBusiness(user.businessId);
  }

  @Get(':staffId')
  findOneStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
  ) {
    return this.staffService.findOneForBusiness(user.businessId, staffId);
  }

  @Patch(':staffId')
  updateStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.updateForBusiness(user.businessId, staffId, dto);
  }

  @Delete(':staffId')
  deleteStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Param('staffId') staffId: string,
  ) {
    return this.staffService.deleteForBusiness(user.businessId, staffId);
  }
}
