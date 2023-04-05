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
import { IAgent } from '../agents/interfaces';
import { IPost } from '../posts/interfaces';
import { ICredit } from '../credits/interfaces';

@Entity('users')
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true, nullable: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  status: string;

  @Column({
    default: false,
  })
  is_agent: boolean;

  @Column({
    default: false,
  })
  is_admin: boolean;

  @Column({
    nullable: true,
  })
  admin_comment: string;

  @OneToMany('Otp', 'user')
  otp: IOtp[];

  @OneToMany('Transaction', 'user')
  transactions: ITransaction[];

  @OneToMany('Agent', 'user')
  agent: IAgent;

  @OneToMany('Post', 'user')
  posts: IPost;

  @OneToMany('ArchivePost', 'user')
  archive_posts: IPost;

  @OneToMany('DeletedPost', 'user')
  deleted_posts: IPost;

  @OneToMany('Credit', 'user')
  credits: ICredit;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
