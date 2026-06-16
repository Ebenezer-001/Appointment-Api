import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async createForBusiness(
    businessId: string | undefined,
    dto: CreateServiceDto,
  ): Promise<Service> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const service = this.serviceRepository.create({
      ...dto,
      businessId,
      isActive: true,
    });

    return this.serviceRepository.save(service);
  }

  async findAllForBusiness(businessId: string | undefined): Promise<Service[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    return this.serviceRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForBusiness(
    businessId: string | undefined,
    serviceId: string,
  ): Promise<Service> {
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
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async updateForBusiness(
    businessId: string | undefined,
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOneForBusiness(businessId, serviceId);

    Object.assign(service, dto);

    return this.serviceRepository.save(service);
  }

  async deleteForBusiness(
    businessId: string | undefined,
    serviceId: string,
  ): Promise<{ message: string }> {
    const service = await this.findOneForBusiness(businessId, serviceId);

    await this.serviceRepository.remove(service);

    return {
      message: 'Service deleted successfully',
    };
  }
}
