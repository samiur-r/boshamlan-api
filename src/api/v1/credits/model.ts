import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { ICredit } from './interfaces';
import { IUser } from '../users/interfaces';
import { User } from '../users/model';

@Entity('credits')
export class Credit extends BaseEntity implements ICredit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  free: number;

  @Column({ default: 0 })
  regular: number;

  @Column({ default: 0 })
  sticky: number;

  @Column({ default: 0 })
  agent: number;

  @OneToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: IUser;
}
