import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async createForBusiness(
    businessId: string | undefined,
    dto: CreateStaffDto,
  ): Promise<Staff> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const staff = this.staffRepository.create({
      ...dto,
      businessId,
      isActive: true,
    });

    return this.staffRepository.save(staff);
  }

  async findAllForBusiness(businessId: string | undefined): Promise<Staff[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    return this.staffRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForBusiness(
    businessId: string | undefined,
    staffId: string,
  ): Promise<Staff> {
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
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async updateForBusiness(
    businessId: string | undefined,
    staffId: string,
    dto: UpdateStaffDto,
  ): Promise<Staff> {
    const staff = await this.findOneForBusiness(businessId, staffId);

    Object.assign(staff, dto);

    return this.staffRepository.save(staff);
  }

  async deleteForBusiness(
    businessId: string | undefined,
    staffId: string,
  ): Promise<{ message: string }> {
    const staff = await this.findOneForBusiness(businessId, staffId);

    await this.staffRepository.remove(staff);

    return {
      message: 'Staff deleted successfully',
    };
  }
}
