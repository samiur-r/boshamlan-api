import { IPackage } from '../packages/interfaces';
import { IUser } from '../users/interfaces';
import { Transaction } from './model';

const saveTransaction = async (payload: {
  trackId: string;
  amount: number;
  packageTitle: string;
  status: string;
  user: IUser;
  packageObj: IPackage;
}) => {
  const {
    trackId,
    amount,
    packageTitle,
    status,
    user,
    packageObj,
  }: {
    trackId: string;
    amount: number;
    packageTitle: string;
    status: string;
    user: IUser;
    packageObj: IPackage;
  } = payload;

  const newTransaction = Transaction.create({
    track_id: trackId,
    package_title: packageTitle,
    amount,
    status,
    user,
    package: packageObj,
  });

  const transaction = await Transaction.save(newTransaction);
  return transaction;
};

const findTransactionByTrackId = async (track_id: string) => {
  const transaction = await Transaction.findOne({ where: { track_id } });
  return transaction;
};

const editTransaction = async (trackId: number, reference_id: string, tran_id: string, status: string) => {
  const transaction = await findTransactionByTrackId(trackId.toString());
  if (!transaction) return { status: 404 };

  const transactionObj = await Transaction.save({
    ...transaction,
    reference_id,
    tran_id,
    status,
  });
  return { status: 200, data: transactionObj };
};

const editTransactionStatus = async (trackId: string | null, status: string) => {
  if (trackId === null) return { status: 404 };
  const transaction = await findTransactionByTrackId(trackId);
  if (!transaction) return { status: 404 };

  await Transaction.save({
    ...transaction,
    status,
  });
  return { status: 200 };
};

export { saveTransaction, editTransaction, editTransactionStatus };
