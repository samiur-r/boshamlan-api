import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { IPackage } from './interfaces';
import { ITransaction } from '../transactions/interfaces';

@Entity('packages')
export class Package extends BaseEntity implements IPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  cost: number;

  @Column()
  expiration_date: Date;

  @OneToMany('Transaction', 'package')
  transaction: ITransaction[];
}
