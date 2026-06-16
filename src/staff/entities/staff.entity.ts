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
import { Availability } from 'src/availability/entities/availability.entity';
import { UnavailablePeriod } from 'src/unavailable-periods/entities/unavailable-period.entity';
import { Appointment } from 'src/appointments/entities/appointments.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => Business, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @OneToMany(() => Availability, (availability) => availability.staff)
  availability: Availability[];

  @OneToMany(
    () => UnavailablePeriod,
    (unavailablePeriod) => unavailablePeriod.staff,
  )
  unavailablePeriods: UnavailablePeriod[];

  @OneToMany(() => Appointment, (appointment) => appointment.staff)
  appointments: Appointment[];

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  role?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
