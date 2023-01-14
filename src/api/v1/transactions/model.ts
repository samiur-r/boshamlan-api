import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IPackage } from '../packages/interfaces';
import { IUser } from '../users/interfaces';

import { ITransaction } from './interfaces';

@Entity('transactions')
export class Transaction extends BaseEntity implements ITransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  status: string;

  @ManyToOne('User', 'transaction')
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  @ManyToOne('Package', 'transaction')
  @JoinColumn({ name: 'package_id' })
  package: IPackage;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
