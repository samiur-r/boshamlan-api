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
import { Package } from '../packages/model';
import { IUser } from '../users/interfaces';
import { User } from '../users/model';

import { ITransaction } from './interfaces';

@Entity('transactions')
export class Transaction extends BaseEntity implements ITransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    type: 'bigint',
  })
  track_id: string;

  @Column({
    default: null,
  })
  reference_id: string;

  @Column({
    default: null,
  })
  tran_id: string;

  @Column({
    default: null,
  })
  response: string;

  @Column()
  amount: number;

  @Column({
    default: 'created',
  })
  status: string;

  @Column()
  package_title: string;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  // @ManyToOne('Package', 'transaction')
  @ManyToOne(() => Package, { nullable: false, eager: true })
  @JoinColumn({ name: 'package_id' })
  package: IPackage;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
