import { Request, Response } from 'express';
import { User } from './model';

const getAll = async (_req: Request, res: Response) => {
  const users = await User.find();
  return res.json(users);
};

const getById = () => {
  return 6;
};

export { getAll, getById };
