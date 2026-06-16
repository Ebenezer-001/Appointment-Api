import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StaffService } from './entities/staff-service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Service } from '../services/entities/service.entity';
import { AssignServiceToStaffDto } from './dto/assign-service-to-staff.dto';

@Injectable()
export class StaffServicesService {
  constructor(
    @InjectRepository(StaffService)
    private readonly staffServiceRepository: Repository<StaffService>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async assignServiceToStaff(
    businessId: string | undefined,
    dto: AssignServiceToStaffDto,
  ): Promise<StaffService> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const staff = await this.staffRepository.findOne({
      where: {
        id: dto.staffId,
        businessId,
        isActive: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found for this business');
    }

    const service = await this.serviceRepository.findOne({
      where: {
        id: dto.serviceId,
        businessId,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
    }

    const existingAssignment = await this.staffServiceRepository.findOne({
      where: {
        businessId,
        staffId: dto.staffId,
        serviceId: dto.serviceId,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        'Service already assigned to this staff member',
      );
    }

    const assignment = this.staffServiceRepository.create({
      businessId,
      staffId: dto.staffId,
      serviceId: dto.serviceId,
    });

    return this.staffServiceRepository.save(assignment);
  }

  async findServicesForStaff(
    businessId: string | undefined,
    staffId: string,
  ): Promise<StaffService[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const staff = await this.staffRepository.findOne({
      where: {
        id: staffId,
        businessId,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found for this business');
    }

    return this.staffServiceRepository.find({
      where: {
        businessId,
        staffId,
      },
      relations: {
        service: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findStaffForService(
    businessId: string | undefined,
    serviceId: string,
  ): Promise<StaffService[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const service = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
        businessId,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for this business');
    }

    return this.staffServiceRepository.find({
      where: {
        businessId,
        serviceId,
      },
      relations: {
        staff: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async removeServiceFromStaff(
    businessId: string | undefined,
    staffId: string,
    serviceId: string,
  ): Promise<{ message: string }> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const assignment = await this.staffServiceRepository.findOne({
      where: {
        businessId,
        staffId,
        serviceId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Staff-service assignment not found');
    }

    await this.staffServiceRepository.remove(assignment);

    return {
      message: 'Service removed from staff successfully',
    };
  }
}
