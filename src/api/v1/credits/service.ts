import { IUser } from '../users/interfaces';
import { Credit } from './model';

const initCredits = async (user: IUser) => {
  const creditData = Credit.create({
    free: 0,
    regular: 0,
    sticky: 0,
    agent: 0,
    user,
  });

  await Credit.save(creditData);
};

const findCreditByUserId = async (user_id: number) => {
  const credit = await Credit.findOne({ where: { user: { id: user_id } } });
  return credit;
};

const updateCredit = async (userId: number, typeOfCredit: string, numberOfCredits: number) => {
  const credit = await findCreditByUserId(userId);
  if (!credit) return { status: 404 };

  const currCredit = credit[typeOfCredit.toString() as keyof typeof credit] || 0;

  await Credit.save({
    ...credit,
    [typeOfCredit]: (currCredit as number) + numberOfCredits,
  });
  return { status: 200 };
};

export { initCredits, updateCredit };
