import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../utils/CustomError';
import { User } from './model';

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    if (!users.length) throw new CustomError(400, 'Users not found');
  } catch (error) {
    return next(error);
  }

  return res.json({ success: 'true' });
};

const getById = () => {
  return 6;
};

const login = async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  return res.status(200).json({ phone, password });
};

export { getAll, getById, login };
