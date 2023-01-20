import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import ErrorHandler from '../../../utils/ErrorHandler';
import { hashPassword, verifyPassword } from '../../../utils/passwordUtils';
import config from '../../../config';
import { findUserByPhone, saveUser } from './service';
import { sendOtpVerificationSms } from '../otps/service';
import { IUser } from './interfaces';
import logger from '../../../utils/logger';

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    const user = await findUserByPhone(phone);
    if (!user) {
      throw new ErrorHandler(403, 'Incorrect phone or password');
    }

    if (user && user.status === 'not_verified') {
      // @ts-ignore
      res.cookie('user_status', 'not_verified', config.cookieOptions);
      return res.status(200).json({ success: 'Please verify your phone number' });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (isValidPassword) {
      throw new ErrorHandler(403, 'Incorrect phone or password');
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, is_admin: user.is_admin, is_agent: user.is_agent, status: user.status },
      config.jwtSecret,
      { expiresIn: 60 * 60 * 24 * 30 },
    );

    // @ts-ignore
    res.cookie('token', token, config.cookieOptions);
    return res.status(200).json({ success: 'Logged in successfully' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err) {
    return next(err);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    const user = await findUserByPhone(phone);
    if (user && user.status !== 'not_verified') throw new ErrorHandler(409, 'User already exists');

    if (user && user.status === 'not_verified') {
      // @ts-ignore
      res.cookie('user_status', 'not_verified', config.cookieOptions);
      return res.status(200).json({ success: 'Please verify your phone number' });
    }

    const hashedPassword = await hashPassword(password);

    const userObj: unknown = await saveUser(phone, hashedPassword, 'not_verified');
    await sendOtpVerificationSms(phone, 'registration', userObj as IUser);

    // @ts-ignore
    res.cookie('user_status', 'not_verified', config.cookieOptions);
    return res.status(200).json({ success: 'Please verify your phone number' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'QueryFailedError') {
      logger.error(`${error.name}: ${error.message}`);
      error.message = 'request failed';
    }

    if (error.message === 'All SMS messages failed to send') {
      logger.error(`MessageSendAllFailure: ${error.message}`);
      error.status = 500;
      error.message = 'failed to send otp';
    }
    return next(error);
  }
};

export { login, register };
