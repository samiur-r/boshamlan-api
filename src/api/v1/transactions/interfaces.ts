export interface ITransaction {
  id: number;
  amount: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  package_title: string;
}
