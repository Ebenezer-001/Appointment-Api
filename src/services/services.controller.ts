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

import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('business-admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_ADMIN)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  createService(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateServiceDto,
  ) {
    return this.servicesService.createForBusiness(user.businessId, dto);
  }

  @Get()
  findAllServices(@CurrentUser() user: CurrentUserPayload) {
    return this.servicesService.findAllForBusiness(user.businessId);
  }

  @Get(':serviceId')
  findOneService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('serviceId') serviceId: string,
  ) {
    return this.servicesService.findOneForBusiness(user.businessId, serviceId);
  }

  @Patch(':serviceId')
  updateService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.updateForBusiness(
      user.businessId,
      serviceId,
      dto,
    );
  }

  @Delete(':serviceId')
  deleteService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('serviceId') serviceId: string,
  ) {
    return this.servicesService.deleteForBusiness(user.businessId, serviceId);
  }
}
