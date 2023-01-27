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

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    await passwordSchema.validate(password, { abortEarly: false });

    const user = await findUserByPhone(phone);
    if (!user) throw new ErrorHandler(403, 'رقم الهاتف أو كلمة المرور غير صحيحين'); // Incorrect phone or password'

    if (user && user.status === 'not_verified')
      return res.status(200).json({ nextOperation: 'verify phone', userId: user.id });

    const isValidPassword = await verifyToken(password, user.password);
    if (!isValidPassword) throw new ErrorHandler(403, 'رقم الهاتف أو كلمة المرور غير صحيحين'); // Incorrect phone or password'

    const userPayload = {
      id: user.id,
      phone: user.phone,
      is_admin: user.is_admin,
      is_agent: user.is_agent,
      status: user.status,
    };

    const token = await signJwt(userPayload);

    // @ts-ignore
    res.cookie('token', token, config.cookieOptions);
    return res.status(200).json({ success: 'تم تسجيل الدخول بنجاح' }); // Logged in successfully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err) {
    return next(err);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    await passwordSchema.validate(password, { abortEarly: false });

    const user = await findUserByPhone(phone);
    if (user && user.status !== 'not_verified') throw new ErrorHandler(409, 'المستخدم موجود اصلا'); // User already exists

    if (user && user.status === 'not_verified')
      return res.status(200).json({ nextOperation: 'verify mobile', userId: user.id });

    const hashedPassword = await hashPassword(password);

    const userObj: IUser = await saveUser(phone, hashedPassword, 'not_verified');
    await sendOtpVerificationSms(phone, 'registration', userObj);

    return res.status(200).json({ nextOperation: 'verify mobile', userId: userObj?.id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'QueryFailedError') {
      logger.error(`${error.name}: ${error.message}`);
      error.message = 'الطلب فشل'; // Request failed
    }

    if (error.message === 'All SMS messages failed to send') {
      logger.error(`MessageSendAllFailure: ${JSON.stringify(error)}`);
      error.status = 500;
      error.message = 'فشل إرسال otp'; // Failed to send otp
    }
    return next(error);
  }
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ success: 'تم تسجيل الخروج بنجاح' }); // Logged out successfully
};

const doesUserExists = async (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    const user = await findUserByPhone(phone);

    if (!user) throw new ErrorHandler(404, 'لم يتم العثور على مستخدم بهذا الهاتف. الرجاء التسجيل'); // No user with this phone is found. Please register

    return res.status(200).json({ userId: user.id });
  } catch (err) {
    return next(err);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    await phoneSchema.validate(phone, { abortEarly: false });
    await passwordSchema.validate(password, { abortEarly: false });

    const user = await findUserByPhone(phone);

    if (!user) throw new ErrorHandler(404, 'لم يتم العثور على مستخدم بهذا الهاتف. الرجاء التسجيل'); // No user with this phone is found. Please register

    const hashedPassword = await hashPassword(password);
    await updateUserPassword(user, hashedPassword);

    return res.status(200).json({ success: 'تم تحديث كلمة السر بنجاح' }); // Password updated successfully
  } catch (err) {
    return next(err);
  }
};

export { login, logout, register, doesUserExists, resetPassword };
