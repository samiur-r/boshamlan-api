export interface IPost {
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
  is_sticky: boolean;
  views: number;
  is_reposted: boolean;
  repost_count: number;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
}
