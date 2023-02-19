import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { IPost } from './interfaces';
import { PostMultimedia } from '../multimedia/model';

import { IUser } from '../users/interfaces';
import { User } from '../users/model';

@Entity('posts')
export class Post extends BaseEntity implements IPost {
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

  @OneToMany('PostMultimedia', 'post')
  post_multimedia: PostMultimedia[];

  @Column()
  price: number;

  @Column()
  description: string;

  @Column({
    default: 'active',
  })
  status: string;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
