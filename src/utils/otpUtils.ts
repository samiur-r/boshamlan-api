import bcrypt from 'bcrypt';

import vonage from '../config/vonage';

export const generateOtp = async () => {
  const otp = Math.floor(Math.random() * 9000 + 1000);
  const token = await bcrypt.hash(otp.toString(), 10);
  const expirationTime = new Date(new Date().getTime() + 10 * 60000); // 10 minutes

  return { otp, token, expirationTime };
};

export const sendSms = async (phone: number, otp: number) => {
  const from = 'Boshamlan';
  const to = `+965${phone}`;
  const text = `OTP: ${otp}. Valid for 10 minutes.`;
  await vonage.sms.send({ to, from, text });
};
