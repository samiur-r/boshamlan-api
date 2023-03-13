import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { IPropertyType } from './interfaces';
import { IPost } from '../posts/interfaces';

@Entity('property_types')
export class PropertyType extends BaseEntity implements IPropertyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: null })
  title_plural: string;

  @Column({ type: 'text', default: null })
  article_rent: string;

  @Column({ type: 'text', default: null })
  article_sale: string;

  @Column({ type: 'text', default: null })
  article_exchange: string;

  @Column({ type: 'text', default: null })
  article_rent_city: string;

  @Column({ type: 'text', default: null })
  article_sale_city: string;

  @Column({ type: 'text', default: null })
  article_exchange_city: string;

  @Column({ type: 'text', default: null })
  article_rent_state: string;

  @Column({ type: 'text', default: null })
  article_sale_state: string;

  @Column({ type: 'text', default: null })
  article_exchange_state: string;

  @Column({ type: 'text', default: null })
  meta_title_rent: string;

  @Column({ type: 'text', default: null })
  meta_title_sale: string;

  @Column({ type: 'text', default: null })
  meta_title_exchange: string;

  @Column({ type: 'text', default: null })
  meta_title_rent_city: string;

  @Column({ type: 'text', default: null })
  meta_title_sale_city: string;

  @Column({ type: 'text', default: null })
  meta_title_exchange_city: string;

  @Column({ type: 'text', default: null })
  meta_title_rent_state: string;

  @Column({ type: 'text', default: null })
  meta_title_sale_state: string;

  @Column({ type: 'text', default: null })
  meta_title_exchange_state: string;

  @Column({ type: 'text', default: null })
  meta_description_rent: string;

  @Column({ type: 'text', default: null })
  meta_description_sale: string;

  @Column({ type: 'text', default: null })
  meta_description_exchange: string;

  @Column({ type: 'text', default: null })
  meta_description_rent_city: string;

  @Column({ type: 'text', default: null })
  meta_description_sale_city: string;

  @Column({ type: 'text', default: null })
  meta_description_exchange_city: string;

  @Column({ type: 'text', default: null })
  meta_description_rent_state: string;

  @Column({ type: 'text', default: null })
  meta_description_sale_state: string;

  @Column({ type: 'text', default: null })
  meta_description_exchange_state: string;

  @OneToMany('Post', 'property_type')
  post: IPost[];
}
