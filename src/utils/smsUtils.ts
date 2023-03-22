import vonage from '../config/vonage';

export const sendSms = async (phone: string, msg: string) => {
  const from = 'Boshamlan';
  const to = `+965${phone}`;
  const text = msg;
  await vonage.sms.send({ to, from, text });
};
