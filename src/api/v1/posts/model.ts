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
import { ICategory } from '../categories/interfaces';
import { PostMultimedia } from '../multimedia/model';
import { IPropertyType } from '../property_types/interfaces';
import { IRegion } from '../regions/interfaces';
import { IUser } from '../users/interfaces';

@Entity('posts')
export class Post extends BaseEntity implements IPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', 'posts')
  @JoinColumn({ name: 'user_id' })
  user: IUser;

  @ManyToOne('Region', 'posts')
  @JoinColumn({ name: 'city_id' })
  city_id: IRegion;

  @ManyToOne('Region', 'posts')
  @JoinColumn({ name: 'state_id' })
  state_id: IRegion;

  @ManyToOne('Category', 'posts')
  @JoinColumn({ name: 'category_id' })
  category: ICategory;

  @ManyToOne('PropertyType', 'posts')
  @JoinColumn({ name: 'property_id' })
  property_type: IPropertyType;

  @OneToMany('PostMultimedia', 'post')
  post_multimedia: PostMultimedia[];

  @Column()
  price: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column()
  is_sticky: boolean;

  @Column()
  views: number;

  @Column()
  is_reposted: boolean;

  @Column()
  repost_count: number;

  @Column()
  archive_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
