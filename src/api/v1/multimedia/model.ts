// eslint-disable-next-line max-classes-per-file
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

import { IMultimedia } from './interfaces';
import { IPost } from '../posts/interfaces';

@Entity('multimedia')
export class Multimedia extends BaseEntity implements IMultimedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;
}

@Entity('post_multimedia')
export class PostMultimedia extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Post', 'post_multimedia')
  @JoinColumn({ name: 'post_id' })
  post: IPost;

  @OneToOne('Multimedia')
  @JoinColumn({ name: 'multimedia_id' })
  multimedia: IMultimedia;
}
