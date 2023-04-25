import { IUser } from '../users/interfaces';

export interface IAgent {
  user?: IUser;
  id: number;
  name: string;
  description: string;
  email: string;
  instagram: string;
  twitter: string;
  facebook: string;
  logo_url: string;
  subscription_start_date: Date | null;
  subscription_ends_date: Date | null;
  created_at: Date;
  updated_at: Date;
  phone?: string;
  socialLinks?: Array<{ image: string; href: string }>;
  user_id?: number;
}

export interface AgentInfoType {
  name: string;
  description: string;
  email: string;
  instagram: string;
  twitter: string;
  facebook: string;
  logo_url: string;
}
