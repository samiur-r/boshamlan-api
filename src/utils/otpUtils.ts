import bcrypt from 'bcrypt';
import { Vonage } from '@vonage/server-sdk';

import config from '../config';

export const generateOtp = async () => {
  const otp = Math.floor(Math.random() * 9000 + 1000);
  const token = await bcrypt.hash(otp.toString(), 10);
  const expirationTime = new Date(new Date().getTime() + 10 * 60000); // 10 minutes

  return { otp, token, expirationTime };
};

export const sendSms = async (phone: number, otp: number) => {
  // @ts-ignore
  const vonage = new Vonage({
    apiKey: config.vonageApiKey,
    apiSecret: config.vonageApiSecret,
  });

  const from = 'Boshamlan';
  const to = `+880${phone}`;
  const text = `OTP: ${otp}. Valid for 10 minutes.`;
  await vonage.sms.send({ to, from, text });
};
