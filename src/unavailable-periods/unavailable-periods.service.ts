import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

import { Staff } from '../staff/entities/staff.entity';
import { UnavailablePeriod } from './entities/unavailable-period.entity';
import { CreateUnavailablePeriodDto } from './dto/create-unavailable-period.dto';
import { UpdateUnavailablePeriodDto } from './dto/update-unavailable-period.dto';

@Injectable()
export class UnavailablePeriodsService {
  constructor(
    @InjectRepository(UnavailablePeriod)
    private readonly unavailablePeriodRepository: Repository<UnavailablePeriod>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async createForBusiness(
    businessId: string | undefined,
    dto: CreateUnavailablePeriodDto,
  ): Promise<UnavailablePeriod> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const startDateTime = new Date(dto.startDateTime);
    const endDateTime = new Date(dto.endDateTime);

    this.validateDateRange(startDateTime, endDateTime);

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

    await this.ensureNoOverlappingUnavailablePeriod(
      businessId,
      dto.staffId,
      startDateTime,
      endDateTime,
    );

    const unavailablePeriod = this.unavailablePeriodRepository.create({
      businessId,
      staffId: dto.staffId,
      startDateTime,
      endDateTime,
      reason: dto.reason,
    });

    return this.unavailablePeriodRepository.save(unavailablePeriod);
  }

  async findAllForBusiness(
    businessId: string | undefined,
  ): Promise<UnavailablePeriod[]> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    return this.unavailablePeriodRepository.find({
      where: { businessId },
      relations: {
        staff: true,
      },
      order: {
        startDateTime: 'ASC',
      },
    });
  }

  async findForStaff(
    businessId: string | undefined,
    staffId: string,
  ): Promise<UnavailablePeriod[]> {
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

    return this.unavailablePeriodRepository.find({
      where: {
        businessId,
        staffId,
      },
      order: {
        startDateTime: 'ASC',
      },
    });
  }

  async updateForBusiness(
    businessId: string | undefined,
    unavailablePeriodId: string,
    dto: UpdateUnavailablePeriodDto,
  ): Promise<UnavailablePeriod> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const unavailablePeriod = await this.unavailablePeriodRepository.findOne({
      where: {
        id: unavailablePeriodId,
        businessId,
      },
    });

    if (!unavailablePeriod) {
      throw new NotFoundException('Unavailable period not found');
    }

    const nextStaffId = dto.staffId ?? unavailablePeriod.staffId;
    const nextStartDateTime = dto.startDateTime
      ? new Date(dto.startDateTime)
      : unavailablePeriod.startDateTime;
    const nextEndDateTime = dto.endDateTime
      ? new Date(dto.endDateTime)
      : unavailablePeriod.endDateTime;

    this.validateDateRange(nextStartDateTime, nextEndDateTime);

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

    await this.ensureNoOverlappingUnavailablePeriod(
      businessId,
      nextStaffId,
      nextStartDateTime,
      nextEndDateTime,
      unavailablePeriod.id,
    );

    unavailablePeriod.staffId = nextStaffId;
    unavailablePeriod.startDateTime = nextStartDateTime;
    unavailablePeriod.endDateTime = nextEndDateTime;

    if (dto.reason !== undefined) {
      unavailablePeriod.reason = dto.reason;
    }

    return this.unavailablePeriodRepository.save(unavailablePeriod);
  }

  async deleteForBusiness(
    businessId: string | undefined,
    unavailablePeriodId: string,
  ): Promise<{ message: string }> {
    if (!businessId) {
      throw new ForbiddenException(
        'Business Admin is not assigned to a business',
      );
    }

    const unavailablePeriod = await this.unavailablePeriodRepository.findOne({
      where: {
        id: unavailablePeriodId,
        businessId,
      },
    });

    if (!unavailablePeriod) {
      throw new NotFoundException('Unavailable period not found');
    }

    await this.unavailablePeriodRepository.remove(unavailablePeriod);

    return {
      message: 'Unavailable period deleted successfully',
    };
  }

  private validateDateRange(startDateTime: Date, endDateTime: Date): void {
    if (Number.isNaN(startDateTime.getTime())) {
      throw new BadRequestException('startDateTime must be a valid date');
    }

    if (Number.isNaN(endDateTime.getTime())) {
      throw new BadRequestException('endDateTime must be a valid date');
    }

    if (startDateTime >= endDateTime) {
      throw new BadRequestException('startDateTime must be before endDateTime');
    }
  }

  private async ensureNoOverlappingUnavailablePeriod(
    businessId: string,
    staffId: string,
    startDateTime: Date,
    endDateTime: Date,
    ignoredUnavailablePeriodId?: string,
  ): Promise<void> {
    const overlappingPeriod = await this.unavailablePeriodRepository.findOne({
      where: {
        businessId,
        staffId,
        startDateTime: LessThan(endDateTime),
        endDateTime: MoreThan(startDateTime),
      },
    });

    if (
      overlappingPeriod &&
      overlappingPeriod.id !== ignoredUnavailablePeriodId
    ) {
      throw new BadRequestException(
        'Unavailable period overlaps with an existing unavailable period',
      );
    }
  }
}
