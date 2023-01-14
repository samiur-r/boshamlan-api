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

@Entity('agents')
export class Agent extends BaseEntity implements IAgent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  email: string;

  @Column()
  instagram: string;

  @Column()
  twitter: string;

  @Column()
  logo_url: string;

  @Column()
  subscription: Date;

  @OneToOne('User')
  @JoinColumn({ name: 'user_id' })
  credit: IUser;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
