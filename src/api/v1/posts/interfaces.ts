import { IUser } from '../users/interfaces';

export interface IPost {
  user?: IUser;
  id: number;
  title: string;
  city_id: number;
  city_title: string;
  state_id: number;
  state_title: string;
  property_id: number;
  property_title: string;
  category_id: number;
  category_title: string;
  price: number;
  description: string;
  media: string[];
  is_sticky?: boolean;
  credit_type: string;
  views: number;
  is_reposted?: boolean;
  repost_count: number;
  sticked_date?: any;
  sticky_expires?: Date | undefined;
  repost_date?: any;
  expiry_date: Date;
  public_date?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  phone?: string;
}
