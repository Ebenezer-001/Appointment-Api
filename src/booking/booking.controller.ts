import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { BookingService } from './booking.service';
import { GetStaffQueryDto } from './dto/get-staff-query.dto';
import { GetAvailableSlotsQueryDto } from './dto/get-available-slots-query.dto';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';
import { CancelPublicAppointmentDto } from './dto/cancel-public-appointment.dto';
import { ReschedulePublicAppointmentDto } from './dto/reschedule-public-appointment.dto';
import { GetPublicAppointmentQueryDto } from './dto/get-public-appointment-query.dto';

@Controller('book')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':bookingSlug')
  getBookingPage(@Param('bookingSlug') bookingSlug: string) {
    return this.bookingService.getBookingPage(bookingSlug);
  }

  @Get(':bookingSlug/services')
  getServices(@Param('bookingSlug') bookingSlug: string) {
    return this.bookingService.getServices(bookingSlug);
  }

  @Get(':bookingSlug/staff')
  getStaff(
    @Param('bookingSlug') bookingSlug: string,
    @Query() query: GetStaffQueryDto,
  ) {
    return this.bookingService.getStaff(bookingSlug, query);
  }

  @Get(':bookingSlug/available-slots')
  getAvailableSlots(
    @Param('bookingSlug') bookingSlug: string,
    @Query() query: GetAvailableSlotsQueryDto,
  ) {
    return this.bookingService.getAvailableSlots(bookingSlug, query);
  }

  @Post(':bookingSlug/appointments')
  createAppointment(
    @Param('bookingSlug') bookingSlug: string,
    @Body() dto: CreatePublicAppointmentDto,
  ) {
    return this.bookingService.createAppointment(bookingSlug, dto);
  }

  @Get(':bookingSlug/appointments/:bookingReference')
  getAppointmentByReference(
    @Param('bookingSlug') bookingSlug: string,
    @Param('bookingReference') bookingReference: string,
    @Query() query: GetPublicAppointmentQueryDto,
  ) {
    return this.bookingService.getAppointmentByReference(
      bookingSlug,
      bookingReference,
      query,
    );
  }

  @Patch(':bookingSlug/appointments/:bookingReference/cancel')
  cancelAppointmentByReference(
    @Param('bookingSlug') bookingSlug: string,
    @Param('bookingReference') bookingReference: string,
    @Body() dto: CancelPublicAppointmentDto,
  ) {
    return this.bookingService.cancelAppointmentByReference(
      bookingSlug,
      bookingReference,
      dto,
    );
  }

  @Patch(':bookingSlug/appointments/:bookingReference/reschedule')
  rescheduleAppointmentByReference(
    @Param('bookingSlug') bookingSlug: string,
    @Param('bookingReference') bookingReference: string,
    @Body() dto: ReschedulePublicAppointmentDto,
  ) {
    return this.bookingService.rescheduleAppointmentByReference(
      bookingSlug,
      bookingReference,
      dto,
    );
  }
}
