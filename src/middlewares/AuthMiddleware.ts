import { NextFunction, Request, Response } from 'express';

import { verifyJwt } from '../utils/jwtUtils';
import ErrorHandler from '../utils/ErrorHandler';

export const isUserAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    const user = await verifyJwt(token);
    res.locals.user = user;
    next();
  } catch (err) {
    next(new ErrorHandler(401, 'You are not authorized'));
  }
};

export const isRequestAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  try {
    await verifyJwt(token as string);
    next();
  } catch (err) {
    next(new ErrorHandler(401, 'You are not authorized'));
  }
};

export const isAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    const user = await verifyJwt(token);
    res.locals.user = user;
    if (!user.payload?.admin_status) throw new ErrorHandler(401, 'You are not authorized');
    next();
  } catch (err) {
    next(err);
  }
};

export const isSuperAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    const { payload } = await verifyJwt(token);
    if (!payload?.admin_status || !payload?.is_super) throw new ErrorHandler(401, 'You are not authorized');
    next();
  } catch (err) {
    next(err);
  }
};
