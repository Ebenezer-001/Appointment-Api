import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { BusinessStatus } from '../common/enums/business-status.enum';
import { User } from 'src/users/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Service } from 'src/services/entities/service.entity';
import { Appointment } from 'src/appointments/entities/appointments.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AppointmentStatus } from 'src/common/enums/appointment-status.enum';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async createBusiness(dto: CreateBusinessDto): Promise<Business> {
    const bookingSlug = await this.generateUniqueSlug(dto.name);

    const business = this.businessRepository.create({
      ...dto,
      bookingSlug,
      status: BusinessStatus.ACTIVE,
    });

    return this.businessRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateBusinessStatus(
    businessId: string,
    status: BusinessStatus,
  ): Promise<Business> {
    const business = await this.findById(businessId);

    business.status = status;

    return this.businessRepository.save(business);
  }
  async findById(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findBySlug(bookingSlug: string): Promise<Business> {
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

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.businessRepository.findOne({ where: { bookingSlug: slug } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async getSuperAdminDashboard() {
    const [
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses,
      totalBusinessAdmins,
      activeBusinessAdmins,
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      completedAppointments,
      recentBusinesses,
      recentAppointments,
    ] = await Promise.all([
      this.businessRepository.count(),

      this.businessRepository.count({
        where: {
          status: BusinessStatus.ACTIVE,
        },
      }),

      this.businessRepository.count({
        where: {
          status: BusinessStatus.INACTIVE,
        },
      }),

      this.userRepository.count({
        where: {
          role: UserRole.BUSINESS_ADMIN,
        },
      }),

      this.userRepository.count({
        where: {
          role: UserRole.BUSINESS_ADMIN,
          isActive: true,
        },
      }),

      this.appointmentRepository.count(),

      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.CONFIRMED,
        },
      }),

      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.CANCELLED,
        },
      }),

      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.COMPLETED,
        },
      }),

      this.businessRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: 5,
      }),

      this.appointmentRepository.find({
        relations: {
          business: true,
          staff: true,
          service: true,
        },
        order: {
          createdAt: 'DESC',
        },
        take: 5,
      }),
    ]);

    return {
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        inactive: inactiveBusinesses,
      },
      businessAdmins: {
        total: totalBusinessAdmins,
        active: activeBusinessAdmins,
        inactive: totalBusinessAdmins - activeBusinessAdmins,
      },
      appointments: {
        total: totalAppointments,
        confirmed: confirmedAppointments,
        cancelled: cancelledAppointments,
        completed: completedAppointments,
      },
      recentBusinesses,
      recentAppointments,
    };
  }

  async getBusinessActivity(businessId: string) {
    const business = await this.businessRepository.findOne({
      where: {
        id: businessId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const [
      businessAdmins,
      totalStaff,
      activeStaff,
      totalServices,
      activeServices,
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      cancelledAppointments,
      completedAppointments,
      recentAppointments,
    ] = await Promise.all([
      this.userRepository.find({
        where: {
          businessId,
          role: UserRole.BUSINESS_ADMIN,
        },
        order: {
          createdAt: 'DESC',
        },
      }),

      this.staffRepository.count({
        where: {
          businessId,
        },
      }),

      this.staffRepository.count({
        where: {
          businessId,
          isActive: true,
        },
      }),

      this.serviceRepository.count({
        where: {
          businessId,
        },
      }),

      this.serviceRepository.count({
        where: {
          businessId,
          isActive: true,
        },
      }),

      this.appointmentRepository.count({
        where: {
          businessId,
        },
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

      this.appointmentRepository.find({
        where: {
          businessId,
        },
        relations: {
          staff: true,
          service: true,
        },
        order: {
          createdAt: 'DESC',
        },
        take: 10,
      }),
    ]);

    return {
      business,
      businessAdmins,
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
      },
      recentAppointments,
    };
  }
}
