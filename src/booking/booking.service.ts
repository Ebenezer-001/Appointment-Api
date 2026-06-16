import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, MoreThan, Not, Repository } from 'typeorm';

import { Business } from '../businesses/entities/business.entity';
import { Service } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffService } from '../staff-services/entities/staff-service.entity';
import { Availability } from '../availability/entities/availability.entity';
import { UnavailablePeriod } from '../unavailable-periods/entities/unavailable-period.entity';
import { Appointment } from '../appointments/entities/appointments.entity';
import { BusinessStatus } from '../common/enums/business-status.enum';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { GetStaffQueryDto } from './dto/get-staff-query.dto';
import { GetAvailableSlotsQueryDto } from './dto/get-available-slots-query.dto';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';
import { randomBytes } from 'crypto';
import { ReschedulePublicAppointmentDto } from './dto/reschedule-public-appointment.dto';
import { CancelPublicAppointmentDto } from './dto/cancel-public-appointment.dto';
import { GetPublicAppointmentQueryDto } from './dto/get-public-appointment-query.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(StaffService)
    private readonly staffServiceRepository: Repository<StaffService>,

    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,

    @InjectRepository(UnavailablePeriod)
    private readonly unavailablePeriodRepository: Repository<UnavailablePeriod>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    private readonly dataSource: DataSource,
  ) {}

  async getBookingPage(bookingSlug: string) {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    return {
      id: business.id,
      name: business.name,
      email: business.email,
      phone: business.phone,
      address: business.address,
      businessType: business.businessType,
      bookingSlug: business.bookingSlug,
    };
  }

  async getServices(bookingSlug: string): Promise<Service[]> {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    return this.serviceRepository.find({
      where: {
        businessId: business.id,
        isActive: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async getStaff(
    bookingSlug: string,
    query: GetStaffQueryDto,
  ): Promise<Staff[]> {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    if (!query.serviceId) {
      return this.staffRepository.find({
        where: {
          businessId: business.id,
          isActive: true,
        },
        order: {
          fullName: 'ASC',
        },
      });
    }

    const service = await this.serviceRepository.findOne({
      where: {
        id: query.serviceId,
        businessId: business.id,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
    }

    const assignments = await this.staffServiceRepository.find({
      where: {
        businessId: business.id,
        serviceId: query.serviceId,
      },
      relations: {
        staff: true,
      },
    });

    return assignments
      .map((assignment) => assignment.staff)
      .filter((staff) => staff.isActive)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async getAvailableSlots(
    bookingSlug: string,
    query: GetAvailableSlotsQueryDto,
  ) {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    const selectedDate = this.parseDateOnly(query.date);

    const service = await this.serviceRepository.findOne({
      where: {
        id: query.serviceId,
        businessId: business.id,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
    }

    const staff = await this.staffRepository.findOne({
      where: {
        id: query.staffId,
        businessId: business.id,
        isActive: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found for this business');
    }

    const staffCanProvideService = await this.staffServiceRepository.findOne({
      where: {
        businessId: business.id,
        staffId: query.staffId,
        serviceId: query.serviceId,
      },
    });

    if (!staffCanProvideService) {
      throw new BadRequestException(
        'Selected staff member does not provide this service',
      );
    }

    const dayOfWeek = selectedDate.getUTCDay();

    const availability = await this.availabilityRepository.findOne({
      where: {
        businessId: business.id,
        staffId: query.staffId,
        dayOfWeek,
      },
    });

    if (!availability) {
      return {
        date: query.date,
        businessId: business.id,
        staffId: query.staffId,
        serviceId: query.serviceId,
        durationMinutes: service.durationMinutes,
        slots: [],
      };
    }

    const dayStart = this.combineDateAndTimeUtc(
      selectedDate,
      availability.startTime,
    );

    const dayEnd = this.combineDateAndTimeUtc(
      selectedDate,
      availability.endTime,
    );

    const unavailablePeriods = await this.unavailablePeriodRepository.find({
      where: {
        businessId: business.id,
        staffId: query.staffId,
        startDateTime: LessThan(dayEnd),
        endDateTime: MoreThan(dayStart),
      },
    });

    const appointments = await this.appointmentRepository.find({
      where: {
        businessId: business.id,
        staffId: query.staffId,
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        startDateTime: LessThan(dayEnd),
        endDateTime: MoreThan(dayStart),
      },
    });

    const slots = this.generateSlots({
      dayStart,
      dayEnd,
      durationMinutes: service.durationMinutes,
      unavailablePeriods,
      appointments,
    });

    return {
      date: query.date,
      businessId: business.id,
      staffId: query.staffId,
      serviceId: query.serviceId,
      durationMinutes: service.durationMinutes,
      slots,
    };
  }

  private async findActiveBusinessBySlug(
    bookingSlug: string,
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: {
        bookingSlug,
        status: BusinessStatus.ACTIVE,
      },
    });

    if (!business) {
      throw new NotFoundException('Business booking page not found');
    }

    return business;
  }

  async createAppointment(
    bookingSlug: string,
    dto: CreatePublicAppointmentDto,
  ): Promise<Appointment> {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    const service = await this.serviceRepository.findOne({
      where: {
        id: dto.serviceId,
        businessId: business.id,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
    }

    const staff = await this.staffRepository.findOne({
      where: {
        id: dto.staffId,
        businessId: business.id,
        isActive: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found for this business');
    }

    const staffCanProvideService = await this.staffServiceRepository.findOne({
      where: {
        businessId: business.id,
        staffId: dto.staffId,
        serviceId: dto.serviceId,
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

    await this.validateSlotIsBookable({
      businessId: business.id,
      staffId: dto.staffId,
      serviceId: dto.serviceId,
      startDateTime,
      endDateTime,
    });

    return this.dataSource.transaction(async (manager) => {
      const conflictingAppointment = await manager.findOne(Appointment, {
        where: {
          businessId: business.id,
          staffId: dto.staffId,
          status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
          startDateTime: LessThan(endDateTime),
          endDateTime: MoreThan(startDateTime),
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException('Selected slot is no longer available');
      }

      const appointment = manager.create(Appointment, {
        businessId: business.id,
        staffId: dto.staffId,
        serviceId: dto.serviceId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        startDateTime,
        endDateTime,
        status: AppointmentStatus.CONFIRMED,
        bookingReference: await this.generateUniqueBookingReference(),
      });

      return manager.save(Appointment, appointment);
    });
  }

  async getAppointmentByReference(
    bookingSlug: string,
    bookingReference: string,
    query: GetPublicAppointmentQueryDto,
  ): Promise<Appointment> {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    const appointment = await this.appointmentRepository.findOne({
      where: {
        businessId: business.id,
        bookingReference,
        customerEmail: query.email,
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

  async cancelAppointmentByReference(
    bookingSlug: string,
    bookingReference: string,
    dto: CancelPublicAppointmentDto,
  ): Promise<Appointment> {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    const appointment = await this.appointmentRepository.findOne({
      where: {
        businessId: business.id,
        bookingReference,
        customerEmail: dto.email,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

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

  async rescheduleAppointmentByReference(
    bookingSlug: string,
    bookingReference: string,
    dto: ReschedulePublicAppointmentDto,
  ): Promise<Appointment> {
    const business = await this.findActiveBusinessBySlug(bookingSlug);

    const appointment = await this.appointmentRepository.findOne({
      where: {
        businessId: business.id,
        bookingReference,
        customerEmail: dto.email,
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

    const service = await this.serviceRepository.findOne({
      where: {
        id: appointment.serviceId,
        businessId: business.id,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
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

    await this.validatePublicRescheduleSlotIsBookable({
      businessId: business.id,
      staffId: appointment.staffId,
      startDateTime,
      endDateTime,
      ignoredAppointmentId: appointment.id,
    });

    appointment.startDateTime = startDateTime;
    appointment.endDateTime = endDateTime;

    return this.appointmentRepository.save(appointment);
  }

  private parseDateOnly(date: string): Date {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    return parsedDate;
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

  private generateSlots(params: {
    dayStart: Date;
    dayEnd: Date;
    durationMinutes: number;
    unavailablePeriods: UnavailablePeriod[];
    appointments: Appointment[];
  }) {
    const {
      dayStart,
      dayEnd,
      durationMinutes,
      unavailablePeriods,
      appointments,
    } = params;

    const slots: Array<{
      startTime: string;
      endTime: string;
      startDateTime: string;
      endDateTime: string;
    }> = [];

    let cursor = new Date(dayStart);

    while (cursor.getTime() + durationMinutes * 60_000 <= dayEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);

      const overlapsUnavailablePeriod = unavailablePeriods.some((period) =>
        this.periodsOverlap(
          slotStart,
          slotEnd,
          period.startDateTime,
          period.endDateTime,
        ),
      );

      const overlapsAppointment = appointments.some((appointment) =>
        this.periodsOverlap(
          slotStart,
          slotEnd,
          appointment.startDateTime,
          appointment.endDateTime,
        ),
      );

      const isInFuture = slotStart.getTime() > Date.now();

      if (!overlapsUnavailablePeriod && !overlapsAppointment && isInFuture) {
        slots.push({
          startTime: this.formatTime(slotStart),
          endTime: this.formatTime(slotEnd),
          startDateTime: slotStart.toISOString(),
          endDateTime: slotEnd.toISOString(),
        });
      }

      cursor = new Date(cursor.getTime() + durationMinutes * 60_000);
    }

    return slots;
  }

  private periodsOverlap(
    newStart: Date,
    newEnd: Date,
    existingStart: Date,
    existingEnd: Date,
  ): boolean {
    return newStart < existingEnd && newEnd > existingStart;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  private async validateSlotIsBookable(params: {
    businessId: string;
    staffId: string;
    serviceId: string;
    startDateTime: Date;
    endDateTime: Date;
  }): Promise<void> {
    const { businessId, staffId, startDateTime, endDateTime } = params;

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
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        startDateTime: LessThan(endDateTime),
        endDateTime: MoreThan(startDateTime),
      },
    });

    if (overlappingAppointment) {
      throw new BadRequestException('Appointment slot is already booked');
    }
  }

  private async generateUniqueBookingReference(): Promise<string> {
    let reference = this.generateBookingReference();

    while (
      await this.appointmentRepository.findOne({
        where: { bookingReference: reference },
      })
    ) {
      reference = this.generateBookingReference();
    }

    return reference;
  }

  private generateBookingReference(): string {
    return `BK-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private async validatePublicRescheduleSlotIsBookable(params: {
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
}
