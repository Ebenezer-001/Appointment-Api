import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Business } from '../../businesses/entities/business.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('unavailable_periods')
export class UnavailablePeriod {
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

  @Column({ name: 'start_datetime', type: 'timestamptz' })
  startDateTime: Date;

  @Column({ name: 'end_datetime', type: 'timestamptz' })
  endDateTime: Date;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
