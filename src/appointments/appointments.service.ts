/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { Appointment } from './entities/appointments.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Service } from 'src/services/entities/service.entity';
import { Availability } from 'src/availability/entities/availability.entity';
import { StaffService } from 'src/staff-services/entities/staff-service.entity';
import { UnavailablePeriod } from 'src/unavailable-periods/entities/unavailable-period.entity';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(StaffService)
    private readonly staffServiceRepository: Repository<StaffService>,

    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,

    @InjectRepository(UnavailablePeriod)
    private readonly unavailablePeriodRepository: Repository<UnavailablePeriod>,
  ) {}

  async findAllForBusiness(
    businessId: string | undefined,
    query: GetAppointmentsQueryDto,
  ): Promise<Appointment[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const where: FindOptionsWhere<Appointment> = {
      businessId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.staffId) {
      where.staffId = query.staffId;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    if (query.from) {
      const fromDate = new Date(query.from);

      if (Number.isNaN(fromDate.getTime())) {
        throw new BadRequestException('from must be a valid date');
      }

      where.startDateTime = MoreThanOrEqual(fromDate);
    }

    if (query.to) {
      const toDate = new Date(query.to);

      if (Number.isNaN(toDate.getTime())) {
        throw new BadRequestException('to must be a valid date');
      }

      where.endDateTime = LessThanOrEqual(toDate);
    }

    return this.appointmentRepository.find({
      where,
      relations: {
        staff: true,
        service: true,
      },
      order: {
        startDateTime: 'ASC',
      },
    });
  }

  async findOneForBusiness(
    businessId: string | undefined,
    appointmentId: string,
  ): Promise<Appointment> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        businessId,
      },
      relations: {
        staff: true,
        service: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async cancelForBusiness(
    businessId: string | undefined,
    appointmentId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOneForBusiness(
      businessId,
      appointmentId,
    );

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed appointment cannot be cancelled',
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;

    return this.appointmentRepository.save(appointment);
  }

  async completeForBusiness(
    businessId: string | undefined,
    appointmentId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOneForBusiness(
      businessId,
      appointmentId,
    );

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'Cancelled appointment cannot be completed',
      );
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Appointment is already completed');
    }

    appointment.status = AppointmentStatus.COMPLETED;

    return this.appointmentRepository.save(appointment);
  }

  async rescheduleForBusiness(
    businessId: string | undefined,
    appointmentId: string,
    dto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        businessId,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'Cancelled appointment cannot be rescheduled',
      );
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed appointment cannot be rescheduled',
      );
    }

    const nextStaffId = dto.staffId ?? appointment.staffId;
    const nextServiceId = dto.serviceId ?? appointment.serviceId;

    const service = await this.serviceRepository.findOne({
      where: {
        id: nextServiceId,
        businessId,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
    }

    const staff = await this.staffRepository.findOne({
      where: {
        id: nextStaffId,
        businessId,
        isActive: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found for this business');
    }

    const staffCanProvideService = await this.staffServiceRepository.findOne({
      where: {
        businessId,
        staffId: nextStaffId,
        serviceId: nextServiceId,
      },
    });

    if (!staffCanProvideService) {
      throw new BadRequestException(
        'Selected staff member does not provide this service',
      );
    }

    const startDateTime = new Date(dto.startDateTime);

    if (Number.isNaN(startDateTime.getTime())) {
      throw new BadRequestException('startDateTime must be a valid date');
    }

    if (startDateTime.getTime() <= Date.now()) {
      throw new BadRequestException('Appointment time must be in the future');
    }

    const endDateTime = new Date(
      startDateTime.getTime() + service.durationMinutes * 60_000,
    );

    await this.validateRescheduledSlotIsBookable({
      businessId,
      staffId: nextStaffId,
      startDateTime,
      endDateTime,
      ignoredAppointmentId: appointment.id,
    });

    appointment.staffId = nextStaffId;
    appointment.serviceId = nextServiceId;
    appointment.startDateTime = startDateTime;
    appointment.endDateTime = endDateTime;

    return this.appointmentRepository.save(appointment);
  }

  private async validateRescheduledSlotIsBookable(params: {
    businessId: string;
    staffId: string;
    startDateTime: Date;
    endDateTime: Date;
    ignoredAppointmentId: string;
  }): Promise<void> {
    const {
      businessId,
      staffId,
      startDateTime,
      endDateTime,
      ignoredAppointmentId,
    } = params;

    const dayOfWeek = startDateTime.getUTCDay();

    const availability = await this.availabilityRepository.findOne({
      where: {
        businessId,
        staffId,
        dayOfWeek,
      },
    });

    if (!availability) {
      throw new BadRequestException('Staff is not available on this day');
    }

    const selectedDate = new Date(
      Date.UTC(
        startDateTime.getUTCFullYear(),
        startDateTime.getUTCMonth(),
        startDateTime.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const workingStartDateTime = this.combineDateAndTimeUtc(
      selectedDate,
      availability.startTime,
    );

    const workingEndDateTime = this.combineDateAndTimeUtc(
      selectedDate,
      availability.endTime,
    );

    if (
      startDateTime < workingStartDateTime ||
      endDateTime > workingEndDateTime
    ) {
      throw new BadRequestException(
        'Appointment time is outside staff working hours',
      );
    }

    const overlappingUnavailablePeriod =
      await this.unavailablePeriodRepository.findOne({
        where: {
          businessId,
          staffId,
          startDateTime: LessThan(endDateTime),
          endDateTime: MoreThan(startDateTime),
        },
      });

    if (overlappingUnavailablePeriod) {
      throw new BadRequestException(
        'Appointment time falls within an unavailable period',
      );
    }

    const overlappingAppointment = await this.appointmentRepository.findOne({
      where: {
        businessId,
        staffId,
        id: Not(ignoredAppointmentId),
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        startDateTime: LessThan(endDateTime),
        endDateTime: MoreThan(startDateTime),
      },
    });

    if (overlappingAppointment) {
      throw new BadRequestException('Appointment slot is already booked');
    }
  }

  private combineDateAndTimeUtc(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);

    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hours,
        minutes,
        0,
        0,
      ),
    );
  }
}
