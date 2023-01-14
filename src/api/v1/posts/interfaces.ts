export interface IPost {
  id: number;
  price: string;
  description: string;
  status: string;
  is_sticky: boolean;
  views: number;
  is_reposted: boolean;
  repost_count: number;
  archive_date: Date;
  created_at: Date;
  updated_at: Date;
}
