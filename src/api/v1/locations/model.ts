import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ILocation } from './interfaces';
import { IPost } from '../posts/interfaces';

@Entity('locations')
export class Location extends BaseEntity implements ILocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    default: null,
  })
  state_id: number;

  @Column({
    default: 0,
  })
  count: number;

  @OneToMany('Post', 'location')
  post: IPost[];
}
