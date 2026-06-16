import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Business } from '../../businesses/entities/business.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Service } from '../../services/entities/service.entity';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

@Entity('appointments')
@Index(['businessId', 'staffId', 'startDateTime', 'endDateTime'])
@Index(['bookingReference'], { unique: true })
export class Appointment {
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

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @Column({ name: 'start_datetime', type: 'timestamptz' })
  startDateTime: Date;

  @Column({ name: 'end_datetime', type: 'timestamptz' })
  endDateTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @Column({ name: 'booking_reference', unique: true })
  bookingReference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
