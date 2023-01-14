export interface IOtp {
  id: number;
  token: string;
  type: string;
  is_used: boolean;
  expiration_date: Date;
  created_at: Date;
  updated_at: Date;
}
