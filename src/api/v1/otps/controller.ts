import { NextFunction, Request, Response } from 'express';

import { findOtpByUserId, sendOtpVerificationSms, updateOtpStatus } from './service';
import ErrorHandler from '../../../utils/ErrorHandler';
import { verifyToken } from '../../../utils/passwordUtils';
import { findUserById, updateUserStatus } from '../users/service';
import logger from '../../../utils/logger';
import { findCreditByUserId, initCredits } from '../credits/service';
import { alertOnSlack } from '../../../utils/slackUtils';
import { sendSms } from '../../../utils/smsUtils';
import { saveUserLog } from '../user_logs/service';
import { signJwt } from '../../../utils/jwtUtils';
import config from '../../../config';
import hasCredits from '../../../utils/doesUserHaveCredits';

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, otpCode, nextOperation } = req.body;

  try {
    if (nextOperation) {
      const user = await findUserById(userId);
      const slackMsg = `Entered reset password OTP\n\n ${
        user?.phone ? `<https://wa.me/965${user?.phone}|${user?.phone}>` : ''
      } - ${user?.admin_comment ? user.admin_comment : ''}`;
      await alertOnSlack('imp', slackMsg);
    }

    const otpObj = await findOtpByUserId(userId);
    if (!otpObj) throw new ErrorHandler(500, 'Otp not found. Please try again with new otp');

    if (new Date() > otpObj.expiration_time)
      throw new ErrorHandler(403, 'Otp has expired. Please try again with a new otp');

    if (otpObj.verified) throw new ErrorHandler(403, 'Otp has already been used. Please try again with a new otp');

    const isValid = await verifyToken(otpCode.toString(), otpObj.token);

    if (!isValid) throw new ErrorHandler(403, 'Incorrect otp');

    await updateOtpStatus(otpObj.id, true);
    if (!nextOperation) {
      await updateUserStatus(userId, 'verified');
      const user: any = await findUserById(userId);
      if (user) {
        await initCredits(user);
        await sendSms(user.phone, 'Congratulations! you have been registered successfully');
      }

      logger.info(`User ${user?.phone} has been verified`);
      await saveUserLog([
        {
          post_id: undefined,
          transaction: undefined,
          user: user?.phone,
          activity: `User ${user?.phone} has been verified`,
        },
      ]);

      const credits = await findCreditByUserId(user.id);

      const userHasCredits = credits ? hasCredits(credits) : false;

      const userPayload = {
        id: user.id,
        phone: user.phone,
        is_agent: user.is_agent,
        status: user.status,
        userHasCredits,
      };

      const token = await signJwt(userPayload);
      // @ts-ignore
      res.cookie('token', token, config.cookieOptions);
      return res.status(200).json({ success: userPayload });
    }
    logger.info(`User ${otpObj.user?.phone} verified OTP`);
    await saveUserLog([
      {
        post_id: undefined,
        transaction: undefined,
        user: otpObj.user?.phone,
        activity: `User ${otpObj.user?.phone} verified OTP`,
      },
    ]);
    return res.status(200).json({ success: 'Otp verified successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Verification of OTP by User ${userId} failed`);
    await saveUserLog([
      {
        post_id: undefined,
        transaction: undefined,
        user: userId,
        activity: `Verification of OTP by User ${userId} failed`,
      },
    ]);
    return next(error);
  }
};

const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, type } = req.body;

  try {
    const user = await findUserById(userId);

    if (!user) throw new ErrorHandler(500, 'Unable to send otp. Please contact support');

    await sendOtpVerificationSms(user.phone, type, user);

    logger.info(`Otp sent to user: ${user?.phone}`);
    await saveUserLog([
      {
        post_id: undefined,
        transaction: undefined,
        user: user?.phone,
        activity: `Otp sent to user: ${user?.phone}`,
      },
    ]);

    return res.status(200).json({ success: 'New otp sent to your phone' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.message === 'All SMS messages failed to send') {
      error.message = 'Failed to send otp';
    }
    logger.error(`Otp failed to sent to user: ${userId}`);
    await saveUserLog([
      {
        post_id: undefined,
        transaction: undefined,
        user: userId,
        activity: `Otp failed to sent to user: ${userId}`,
      },
    ]);
    return next(error);
  }
};

export { verifyOtp, resendOtp };
