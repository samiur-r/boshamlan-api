import bcrypt from 'bcrypt';
import { Vonage } from '@vonage/server-sdk';

import { Otp } from '../otps/model';
import { IUser } from './interfaces';
import config from '../../../config';
import { verifyPassword } from '../../../utils/passwordUtils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const vonage = new Vonage({
  apiKey: config.vonageApiKey,
  apiSecret: config.vonageApiSecret,
});

const generateOtp = async (user: IUser, type: string) => {
  const otp = Math.floor(Math.random() * 9000 + 1000);
  const token = await bcrypt.hash(otp.toString(), 10);
  const expirationTime = new Date(new Date().getTime() + 10 * 60000); // 10 minutes

  const otpData = Otp.create({
    token,
    expiration_time: expirationTime,
    type,
    user,
  });

  await Otp.save(otpData);
  return { otp, phone: user.phone };
};

export const sendOtpVerificationSms = async (user: IUser, type: string) => {
  const { otp, phone } = await generateOtp(user, type);
  const from = 'Boshamlan';
  const to = `+88${phone}`;
  const text = `OTP: ${otp}. Valid for 5 minutes.`;
  await vonage.sms.send({ to, from, text });
};

export const verifyOtp = async (id: number, otp: number) => {
  const otpObj = await Otp.findOneBy({ id });
  if (!otpObj) return { isValid: false, msg: 'not found' };

  if (new Date() > otpObj.expiration_time) return { isValid: false, msg: 'otp has expired' };

  const isValid = await verifyPassword(otp.toString(), otpObj.token);
  if (isValid) return { isValid: true, msg: 'otp is valid' };

  return { isValid: false, msg: 'otp is invalid' };
};
