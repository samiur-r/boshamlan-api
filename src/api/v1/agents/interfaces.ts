export interface IAgent {
  id: number;
  name: string;
  description: string;
  email: string;
  instagram: string;
  twitter: string;
  facebook: string;
  logo_url: string;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
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
