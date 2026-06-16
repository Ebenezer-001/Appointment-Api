import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Availability } from './entities/availability.entity';
import { Staff } from '../staff/entities/staff.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async createForBusiness(
    businessId: string | undefined,
    dto: CreateAvailabilityDto,
  ): Promise<Availability> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    this.validateTimeRange(dto.startTime, dto.endTime);

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

    const existingAvailability = await this.availabilityRepository.findOne({
      where: {
        businessId,
        staffId: dto.staffId,
        dayOfWeek: dto.dayOfWeek,
      },
    });

    if (existingAvailability) {
      throw new BadRequestException(
        'Availability already exists for this staff member on this day',
      );
    }

    const availability = this.availabilityRepository.create({
      businessId,
      staffId: dto.staffId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAllForBusiness(
    businessId: string | undefined,
  ): Promise<Availability[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    return this.availabilityRepository.find({
      where: { businessId },
      relations: {
        staff: true,
      },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async findForStaff(
    businessId: string | undefined,
    staffId: string,
  ): Promise<Availability[]> {
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

    return this.availabilityRepository.find({
      where: {
        businessId,
        staffId,
      },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async updateForBusiness(
    businessId: string | undefined,
    availabilityId: string,
    dto: UpdateAvailabilityDto,
  ): Promise<Availability> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const availability = await this.availabilityRepository.findOne({
      where: {
        id: availabilityId,
        businessId,
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    const nextStartTime = dto.startTime ?? availability.startTime;
    const nextEndTime = dto.endTime ?? availability.endTime;

    this.validateTimeRange(nextStartTime, nextEndTime);

    if (dto.staffId) {
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
    }

    Object.assign(availability, dto);

    return this.availabilityRepository.save(availability);
  }

  async deleteForBusiness(
    businessId: string | undefined,
    availabilityId: string,
  ): Promise<{ message: string }> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const availability = await this.availabilityRepository.findOne({
      where: {
        id: availabilityId,
        businessId,
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.availabilityRepository.remove(availability);

    return {
      message: 'Availability deleted successfully',
    };
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }
}
