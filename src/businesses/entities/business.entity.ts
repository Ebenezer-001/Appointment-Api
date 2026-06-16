/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessStatus } from '../../common/enums/business-status.enum';
import { User } from '../../users/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Service } from 'src/services/entities/service.entity';
import { Availability } from 'src/availability/entities/availability.entity';
import { UnavailablePeriod } from 'src/unavailable-periods/entities/unavailable-period.entity';
import { Appointment } from 'src/appointments/entities/appointments.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'business_type', nullable: true })
  businessType?: string;

  @Column({ name: 'booking_slug', unique: true })
  bookingSlug: string;

  @OneToMany(() => Staff, (staff) => staff.business)
  staff: Staff[];

  @OneToMany(() => Service, (service) => service.business)
  services: Service[];

  @OneToMany(() => Availability, (availability) => availability.business)
  availability: Availability[];

  @OneToMany(
    () => UnavailablePeriod,
    (unavailablePeriod) => unavailablePeriod.business,
  )
  unavailablePeriods: UnavailablePeriod[];

  @OneToMany(() => Appointment, (appointment) => appointment.business)
  appointments: Appointment[];

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.ACTIVE,
  })
  status: BusinessStatus;

  @OneToMany(() => User, (user) => user.business)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
