import { NextFunction, Request, Response } from 'express';

import { hashPassword, verifyToken } from '../../../utils/passwordUtils';
import logger from '../../../utils/logger';
import { findAdminByPhone, saveAdmin } from './service';
import ErrorHandler from '../../../utils/ErrorHandler';
import { signJwt } from '../../../utils/jwtUtils';

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);

    await saveAdmin(phone, hashedPassword);
    return res.status(200).json({ success: 'New admin created successfully' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    const admin = await findAdminByPhone(phone);
    if (!admin) throw new ErrorHandler(403, 'Incorrect phone or password');

    const isValidPassword = await verifyToken(password, admin.password);
    if (!isValidPassword) throw new ErrorHandler(403, 'Incorrect phone or password');

    const adminPayload = {
      id: admin.id,
      phone: admin.phone,
      is_super: admin.is_super,
    };

    const token = await signJwt(adminPayload);

    // @ts-ignore
    res.cookie('token', token, config.cookieOptions);
    return res.status(200).json({ success: 'Logged in successfully' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ success: 'Logged out successfully' });
};

export { register, login, logout };
