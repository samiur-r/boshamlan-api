import vonage from '../config/vonage';
import logger from './logger';

export const sendSms = async (phone: string, msg: string) => {
  logger.info(`Sending sms to ${phone}: ${msg}`);
  const from = 'Boshamlan';
  const to = `+965${phone}`;
  const text = msg;
  await vonage.sms.send({ to, from, text });
};
