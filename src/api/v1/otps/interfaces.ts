export interface IOtp {
  id: number;
  token: string;
  type: string;
  verified: boolean;
  expiration_time: Date;
  created_at: Date;
}
