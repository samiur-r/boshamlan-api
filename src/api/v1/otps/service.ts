import { generateOtp, sendSms } from '../../../utils/otpUtils';
import { IUser } from '../users/interfaces';
import { Otp } from './model';

const findOtpById = async (id: number) => {
  const otp = await Otp.findOneBy({ id });
  return otp;
};

const findOtpByUserId = async (userId: number) => {
  const otp = await Otp.findOne({ where: { user: { id: userId } } });
  return otp;
};

const removeOtp = async (id: number) => {
  await Otp.delete(id);
};

const saveOtp = async (token: string, expirationTime: Date, type: string, user: IUser) => {
  const otpData = Otp.create({
    token,
    expiration_time: expirationTime,
    type,
    user,
  });

  await Otp.save(otpData);
};

const updateOtpStatus = async (id: number, status: boolean) => {
  const otpObj = await Otp.findOneBy({ id });

  const otp = await Otp.save({
    ...otpObj,
    verified: status,
  });
  return otp;
};

const sendOtpVerificationSms = async (phone: string, type: string, user: IUser) => {
  const { otp, token, expirationTime } = await generateOtp();
  await sendSms(phone, otp);

  const otpObj = await findOtpByUserId(user.id);
  if (otpObj) await removeOtp(otpObj.id);

  await saveOtp(token, expirationTime, type, user);
};

export { sendOtpVerificationSms, findOtpById, removeOtp, findOtpByUserId, updateOtpStatus };
