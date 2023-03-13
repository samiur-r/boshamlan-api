import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ICategory } from './interfaces';
import { IPost } from '../posts/interfaces';

@Entity('categories')
export class Category extends BaseEntity implements ICategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', default: null })
  article: string;

  @Column({ type: 'text', default: null })
  article_city: string;

  @Column({ type: 'text', default: null })
  article_state: string;

  @Column({ type: 'text', default: null })
  meta_title: string;

  @Column({ type: 'text', default: null })
  meta_title_city: string;

  @Column({ type: 'text', default: null })
  meta_title_state: string;

  @Column({ type: 'text', default: null })
  meta_description: string;

  @Column({ type: 'text', default: null })
  meta_description_city: string;

  @Column({ type: 'text', default: null })
  meta_description_state: string;

  @OneToMany('Post', 'category')
  post: IPost[];
}
