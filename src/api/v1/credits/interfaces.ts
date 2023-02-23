import { IUser } from '../users/interfaces';

export interface ICredit {
  user?: IUser;
  id: number;
  free: number;
  regular: number;
  sticky: number;
  agent: number;
}
