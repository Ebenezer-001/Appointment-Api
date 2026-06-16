import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { Staff } from '../staff/entities/staff.entity';
import { Service } from '../services/entities/service.entity';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { Appointment } from 'src/appointments/entities/appointments.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getBusinessDashboard(businessId: string | undefined) {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const now = new Date();

    const todayStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const todayEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const [
      totalStaff,
      activeStaff,
      totalServices,
      activeServices,
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      cancelledAppointments,
      completedAppointments,
      upcomingAppointments,
      todayAppointments,
    ] = await Promise.all([
      this.staffRepository.count({
        where: { businessId },
      }),

      this.staffRepository.count({
        where: { businessId, isActive: true },
      }),

      this.serviceRepository.count({
        where: { businessId },
      }),

      this.serviceRepository.count({
        where: { businessId, isActive: true },
      }),

      this.appointmentRepository.count({
        where: { businessId },
      }),

      this.appointmentRepository.count({
        where: {
          businessId,
          status: AppointmentStatus.CONFIRMED,
        },
      }),

      this.appointmentRepository.count({
        where: {
          businessId,
          status: AppointmentStatus.PENDING,
        },
      }),

      this.appointmentRepository.count({
        where: {
          businessId,
          status: AppointmentStatus.CANCELLED,
        },
      }),

      this.appointmentRepository.count({
        where: {
          businessId,
          status: AppointmentStatus.COMPLETED,
        },
      }),

      this.appointmentRepository.count({
        where: {
          businessId,
          status: AppointmentStatus.CONFIRMED,
          startDateTime: MoreThanOrEqual(now),
        },
      }),

      this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.business_id = :businessId', { businessId })
        .andWhere('appointment.start_datetime >= :todayStart', { todayStart })
        .andWhere('appointment.start_datetime <= :todayEnd', { todayEnd })
        .getCount(),
    ]);

    const recentAppointments = await this.appointmentRepository.find({
      where: { businessId },
      relations: {
        staff: true,
        service: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 5,
    });

    return {
      staff: {
        total: totalStaff,
        active: activeStaff,
        inactive: totalStaff - activeStaff,
      },
      services: {
        total: totalServices,
        active: activeServices,
        inactive: totalServices - activeServices,
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        cancelled: cancelledAppointments,
        completed: completedAppointments,
        upcoming: upcomingAppointments,
        today: todayAppointments,
      },
      recentAppointments,
    };
  }
}
