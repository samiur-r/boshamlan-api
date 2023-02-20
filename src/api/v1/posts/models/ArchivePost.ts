import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';

import { IPost } from '../interfaces';

import { IUser } from '../../users/interfaces';
import { User } from '../../users/model';

@Entity('archive_posts')
export class ArchivePost extends BaseEntity implements IPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  @Column()
  city_id: number;

  @Column()
  city_title: string;

  @Column()
  state_id: number;

  @Column()
  state_title: string;

  @Column()
  category_id: number;

  @Column()
  category_title: string;

  @Column()
  property_id: number;

  @Column()
  property_title: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_sticky: boolean;

  @Column({
    default: 0,
  })
  views: number;

  @Column({
    default: false,
  })
  is_reposted: boolean;

  @Column({
    default: 0,
  })
  repost_count: number;

  @Column()
  expiry_date: Date;

  @Column('text', { array: true, nullable: true })
  media: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
