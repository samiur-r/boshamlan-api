import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';

import { IUser } from './interfaces';
import { IOtp } from '../otps/interfaces';
import { ITransaction } from '../transactions/interfaces';

@Entity('users')
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  phone: number;

  @Column()
  password: string;

  @Column()
  status: string;

  @Column()
  is_agent: boolean;

  @Column()
  admin_comment: string;

  @OneToMany('Otp', 'user')
  otp: IOtp[];

  @OneToMany('Transaction', 'user')
  transaction: ITransaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
