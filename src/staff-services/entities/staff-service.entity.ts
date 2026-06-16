import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Business } from '../../businesses/entities/business.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('staff_services')
@Unique(['businessId', 'staffId', 'serviceId'])
export class StaffService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => Business, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ name: 'staff_id' })
  staffId: string;

  @ManyToOne(() => Staff, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => Service, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
