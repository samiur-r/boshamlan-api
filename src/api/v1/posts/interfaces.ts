export interface IPost {
  id: number;
  city_id: number;
  city_name: string;
  state_id: number;
  state_name: string;
  property_id: number;
  property_name: string;
  category_id: number;
  category_name: string;
  price: number;
  description: string;
  status: string;
  is_sticky: boolean;
  views: number;
  is_reposted: boolean;
  repost_count: number;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
}
