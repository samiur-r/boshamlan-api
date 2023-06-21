import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

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

  @Column({
    default: false,
  })
  verified: boolean;

  @Column()
  expiration_time: Date;

  @ManyToOne('User', 'otp')
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  @CreateDateColumn()
  created_at: Date;
}
