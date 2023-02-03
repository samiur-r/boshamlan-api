import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { IPackage } from './interfaces';
import { ITransaction } from '../transactions/interfaces';

@Entity('packages')
export class Package extends BaseEntity implements IPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  cost: number;

  @Column()
  numberOfCredits: number;

  @OneToMany('Transaction', 'package')
  transaction: ITransaction[];
}
