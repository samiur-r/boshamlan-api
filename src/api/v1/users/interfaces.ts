export interface IUser {
  id: number;
  phone: string;
  password: string;
  status: string;
  is_blocked: boolean;
  is_deleted: boolean;
  is_agent: boolean;
  admin_comment: string;
  created_at: Date;
  updated_at: Date;
}
