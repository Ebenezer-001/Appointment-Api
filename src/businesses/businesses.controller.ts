import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateBusinessStatusDto } from './dto/update-business-status.dto';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('dashboard')
  getDashboard() {
    return this.businessesService.getSuperAdminDashboard();
  }

  @Post('businesses')
  createBusiness(@Body() dto: CreateBusinessDto) {
    return this.businessesService.createBusiness(dto);
  }

  @Patch('businesses/:businessId/status')
  updateBusinessStatus(
    @Param('businessId') businessId: string,
    @Body() dto: UpdateBusinessStatusDto,
  ) {
    return this.businessesService.updateBusinessStatus(businessId, dto.status);
  }

  @Get('businesses')
  findAllBusinesses() {
    return this.businessesService.findAll();
  }

  @Get('businesses/:businessId')
  findBusinessById(@Param('businessId') businessId: string) {
    return this.businessesService.findById(businessId);
  }

  @Get('businesses/:businessId/activity')
  getBusinessActivity(@Param('businessId') businessId: string) {
    return this.businessesService.getBusinessActivity(businessId);
  }
}
