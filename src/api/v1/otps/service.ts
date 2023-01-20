import { generateOtp, sendSms } from '../../../utils/otpUtils';
import { IUser } from '../users/interfaces';
import { Otp } from './model';

const saveOtp = async (token: string, expirationTime: Date, type: string, user: IUser) => {
  const otpData = Otp.create({
    token,
    expiration_time: expirationTime,
    type,
    user,
  });

  await Otp.save(otpData);
};

const sendOtpVerificationSms = async (phone: number, type: string, user: IUser) => {
  const { otp, token, expirationTime } = await generateOtp();

  await sendSms(phone, otp);
  await saveOtp(token, expirationTime, type, user);
};

export { sendOtpVerificationSms };
