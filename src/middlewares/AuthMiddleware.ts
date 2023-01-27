import { NextFunction, Request, Response } from 'express';

import { verifyJwt } from '../utils/jwtUtils';
import ErrorHandler from '../utils/ErrorHandler';

export const isUserAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    await verifyJwt(token);
    next();
  } catch (err) {
    next(new ErrorHandler(401, 'You are not authorized'));
  }
};

export const isAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    const { payload } = await verifyJwt(token);
    if (!payload?.is_admin) throw new ErrorHandler(401, 'You are not authorized');
    next();
  } catch (err) {
    next(err);
  }
};
