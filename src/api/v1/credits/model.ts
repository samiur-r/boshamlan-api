import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { ICredit } from './interfaces';
import { IUser } from '../users/interfaces';

@Entity('credits')
export class Credit extends BaseEntity implements ICredit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  free: number;

  @Column()
  regular: number;

  @Column()
  sticky: number;

  @Column()
  agent: number;

  @OneToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: IUser;
}
