import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Controller('business-admin/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_ADMIN)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAllAppointments(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: GetAppointmentsQueryDto,
  ) {
    return this.appointmentsService.findAllForBusiness(user.businessId, query);
  }

  @Get(':appointmentId')
  findOneAppointment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.appointmentsService.findOneForBusiness(
      user.businessId,
      appointmentId,
    );
  }

  @Patch(':appointmentId/cancel')
  cancelAppointment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.appointmentsService.cancelForBusiness(
      user.businessId,
      appointmentId,
    );
  }

  @Patch(':appointmentId/complete')
  completeAppointment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.appointmentsService.completeForBusiness(
      user.businessId,
      appointmentId,
    );
  }

  @Patch(':appointmentId/reschedule')
  rescheduleAppointment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('appointmentId') appointmentId: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.rescheduleForBusiness(
      user.businessId,
      appointmentId,
      dto,
    );
  }
}
