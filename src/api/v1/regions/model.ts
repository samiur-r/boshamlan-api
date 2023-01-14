import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { IRegion } from './interfaces';
import { IPost } from '../posts/interfaces';

@Entity('regions')
export class Region extends BaseEntity implements IRegion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne('Region', 'region')
  @JoinColumn({ name: 'state_id' })
  region: IRegion;

  @OneToMany('Post', 'region')
  post: IPost[];
}
