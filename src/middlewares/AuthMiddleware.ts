import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../api/v1/users/interfaces';

import config from '../config';
import ErrorHandler from '../utils/ErrorHandler';

export const isUserAuth = (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    jwt.verify(token, config.jwtSecret);
    next();
  } catch (err) {
    next(new ErrorHandler(401, 'You are not authorized'));
  }
};

export const isAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const { signedCookies = {} } = req;
  const { token } = signedCookies;

  try {
    const user = jwt.verify(token, config.jwtSecret) as IUser;
    if (!user.is_admin) throw new ErrorHandler(401, 'You are not authorized');
    next();
  } catch (err) {
    next(err);
  }
};
