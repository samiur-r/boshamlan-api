import { Package } from './model';

const findPackageById = async (id: number) => {
  const packageObj = await Package.findOneBy({ id });
  return packageObj;
};

const findNumOfCreditsByTitle = async (title: string) => {
  const response = await Package.findOne({ select: { numberOfCredits: true }, where: { title } });
  return response?.numberOfCredits;
};

export { findPackageById, findNumOfCreditsByTitle };
