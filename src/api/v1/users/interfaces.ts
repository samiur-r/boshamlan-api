export interface IUser {
  id: number;
  phone: number;
  password: string;
  status: string;
  is_admin: boolean;
  is_agent: boolean;
  admin_comment: string;
  created_at: Date;
  updated_at: Date;
}
