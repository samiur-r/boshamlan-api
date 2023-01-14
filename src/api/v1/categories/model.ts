import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ICategory } from './interfaces';
import { IPost } from '../posts/interfaces';

@Entity('categories')
export class Category extends BaseEntity implements ICategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @OneToMany('Post', 'category')
  post: IPost[];
}
