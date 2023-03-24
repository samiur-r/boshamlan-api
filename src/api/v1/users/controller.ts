import { NextFunction, Request, Response } from 'express';

import ErrorHandler from '../../../utils/ErrorHandler';
import { hashPassword, verifyToken } from '../../../utils/passwordUtils';
import config from '../../../config';
import { findUserByPhone, saveUser, updateUserPassword } from './service';
import { sendOtpVerificationSms } from '../otps/service';
import { IUser } from './interfaces';
import logger from '../../../utils/logger';
import { phoneSchema, passwordSchema } from './validation';
import { signJwt } from '../../../utils/jwtUtils';
import { alertOnSlack } from '../../../utils/slackUtils';
import { sendSms } from '../../../utils/smsUtils';
import { saveUserLog } from '../user_logs/service';

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    await passwordSchema.validate(password, { abortEarly: false });

    const user = await findUserByPhone(phone);
    if (!user) throw new ErrorHandler(403, 'Incorrect phone or password');

    if (user && user.status === 'not_verified')
      return res.status(200).json({ nextOperation: 'verify phone', userId: user.id });

    const isValidPassword = await verifyToken(password, user.password);
    if (!isValidPassword) throw new ErrorHandler(403, 'Incorrect phone or password');

    const userPayload = {
      id: user.id,
      phone: user.phone,
      is_admin: user.is_admin,
      is_agent: user.is_agent,
      status: user.status,
    };

    const token = await signJwt(userPayload);

    logger.info(`User: ${user?.phone} logged in successfully`);
    await saveUserLog([
      { post_id: undefined, transaction: undefined, user: user.phone, activity: 'Logged in successfully' },
    ]);

    // @ts-ignore
    res.cookie('token', token, config.cookieOptions);
    return res.status(200).json({ success: userPayload }); // Logged in successfully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`User: ${phone} logged in attempt failed`);
    await saveUserLog([
      { post_id: undefined, transaction: undefined, user: phone, activity: 'Logged in attempt failed' },
    ]);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    const slackMsg = `Failed login attempt\n\n ${phone ? `User: <https://wa.me/965${phone}|${phone}>` : ''}`;
    await alertOnSlack('non-imp', slackMsg);
    return next(error);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    await passwordSchema.validate(password, { abortEarly: false });

    const user = await findUserByPhone(phone);
    if (user && user.status !== 'not_verified') throw new ErrorHandler(409, 'User already exists');

    if (user && user.status === 'not_verified')
      return res.status(200).json({ nextOperation: 'verify mobile', userId: user.id });

    const hashedPassword = await hashPassword(password);

    const userObj: IUser = await saveUser(phone, hashedPassword, 'not_verified');
    await sendOtpVerificationSms(phone, 'registration', userObj);

    logger.info(`Registration attempt by user ${user?.phone}. Otp sent `);
    await saveUserLog([
      { post_id: undefined, transaction: undefined, user: phone, activity: 'Registration attempt. Otp sent' },
    ]);

    return res.status(200).json({ nextOperation: true, userId: userObj?.id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
      const slackMsg = `Invalid user payload\n\n ${phone ? `User: <https://wa.me/965${phone}|${phone}>` : ''}`;
      await alertOnSlack('non-imp', slackMsg);
      return next(error);
    }
    if (error.message === 'All SMS messages failed to send') {
      error.message = 'Failed to send otp';
    }

    logger.error(`Registration attempt failed by user ${phone}`);
    await saveUserLog([
      { post_id: undefined, transaction: undefined, user: phone, activity: 'Registration attempt failed' },
    ]);

    return next(error);
  }
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ success: 'Logged out successfully' });
};

const doesUserExists = async (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    const user = await findUserByPhone(phone);

    if (!user) throw new ErrorHandler(404, 'No user with this phone is found. Please register');

    return res.status(200).json({ userId: user.id });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    await passwordSchema.validate(password, { abortEarly: false });

    const user = await findUserByPhone(phone);

    if (!user) throw new ErrorHandler(404, 'No user with this phone is found. Please register');

    await updateUserPassword(user, password);

    logger.info(`Password reset attempt by user ${phone} successful`);
    await saveUserLog([
      { post_id: undefined, transaction: undefined, user: phone, activity: 'Password reset attempt successful' },
    ]);

    const slackMsg = `Password reset successfully\n\n ${
      user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''
    }`;
    await alertOnSlack('imp', slackMsg);
    await sendSms(user.phone, 'Password reset successfully');
    return res.status(200).json({ success: 'Password updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Password reset attempt by user ${phone} failed`);
    await saveUserLog([
      { post_id: undefined, transaction: undefined, user: phone, activity: 'Password reset attempt failed' },
    ]);
    return next(error);
  }
};

export { login, logout, register, doesUserExists, resetPassword };
