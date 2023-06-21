import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
} from 'typeorm';

import { IAgent } from './interfaces';
import { IUser } from '../users/interfaces';
import { User } from '../users/model';

@Entity('agents')
export class Agent extends BaseEntity implements IAgent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  subscription_start_date: Date;

  @Column({ nullable: true })
  subscription_ends_date: Date;

  @OneToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
