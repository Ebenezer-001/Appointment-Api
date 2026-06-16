import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Business } from '../../businesses/entities/business.entity';
import { StaffService } from 'src/staff-services/entities/staff-service.entity';
import { Appointment } from 'src/appointments/entities/appointments.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => Business, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @OneToMany(() => StaffService, (staffService) => staffService.service)
  staffServices: StaffService[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
