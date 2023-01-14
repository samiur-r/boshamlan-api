import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IOtp } from './interfaces';
import { IUser } from '../users/interfaces';

@Entity('otp_requests')
export class Otp extends BaseEntity implements IOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  type: string;

  @Column()
  is_used: boolean;

  @Column()
  expiration_date: Date;

  @ManyToOne('User', 'otp')
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
