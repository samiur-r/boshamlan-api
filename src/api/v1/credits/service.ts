import { In } from 'typeorm';
import ErrorHandler from '../../../utils/ErrorHandler';
import { IUser } from '../users/interfaces';
import { ICredit } from './interfaces';
import { Credit } from './model';

const initCredits = async (user: IUser) => {
  const creditData = Credit.create({
    free: 2,
    regular: 0,
    sticky: 0,
    agent: 0,
    user,
  });

  await Credit.save(creditData);
};

const findCreditByUserId = async (user_id: number) => {
  const credit: ICredit | null = await Credit.findOne({ where: { user: { id: user_id } } });

  return credit;
};

const updateCredit = async (
  userId: number,
  typeOfCredit: string,
  numberOfCredits: number,
  operation: string, // ADD or SUB
  creditData?: ICredit,
) => {
  let credit;
  if (!creditData) {
    credit = await findCreditByUserId(userId);
    if (!credit) throw new ErrorHandler(500, 'Something went wrong');
  } else credit = creditData;

  const currCredit = credit[typeOfCredit.toString() as keyof typeof credit] || 0;
  const creditsToUpdate =
    operation === 'ADD' ? (currCredit as number) + numberOfCredits : (currCredit as number) - numberOfCredits;

  const updatedCredit = await Credit.save({
    ...credit,
    [typeOfCredit]: creditsToUpdate,
  });
  return updatedCredit;
};

const typeOfCreditToDeduct = async (
  userId: number,
  is_agent: boolean,
  isStickyPost: boolean,
  isStickyOnly: boolean | undefined,
) => {
  const credit = await findCreditByUserId(userId);
  if (!credit) throw new ErrorHandler(500, 'Something went wrong');

  let typeOfCredit;

  if (isStickyOnly) {
    if (credit.sticky > 0) typeOfCredit = 'sticky';
  } else if (isStickyPost) {
    if (credit.sticky > 0) typeOfCredit = 'sticky';
  } else if (credit.free > 0) typeOfCredit = 'free';
  else if (credit.agent > 0 && is_agent) typeOfCredit = 'agent';
  else if (credit.regular > 0) typeOfCredit = 'regular';

  return { typeOfCredit, credit };
};

const updateAgentCredit = async (ids: number[], value: number) => {
  await Credit.update({ user: { id: In(ids) } }, { agent: value });
};

const findStickyCredits = async (userId: number) => {
  const credits = await Credit.findOne({ where: { user: { id: userId } } });

  if (!credits) return 0;
  return credits.sticky;
};

const findFreeCredits = async (userId: number) => {
  const credits = await Credit.findOne({ where: { user: { id: userId } } });

  if (!credits) return 0;
  return credits.free;
};

const setCreditsToZeroByUserId = async (userId: number) => {
  const credits = await Credit.findOne({ where: { user: { id: userId } } });

  await Credit.save({
    ...credits,
    regular: 0,
    free: 0,
    sticky: 0,
    agent: 0,
  });
};

export {
  initCredits,
  updateCredit,
  updateAgentCredit,
  findCreditByUserId,
  typeOfCreditToDeduct,
  findStickyCredits,
  setCreditsToZeroByUserId,
  findFreeCredits,
};
