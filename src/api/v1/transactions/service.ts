import { Between, MoreThanOrEqual, LessThanOrEqual, Like } from 'typeorm';
import { alertOnSlack } from '../../../utils/slackUtils';
import { sendSms } from '../../../utils/smsUtils';
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

  if (status === 'created') {
    const slackMsg = `Payment created\n\n ${
      user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''
    }`;
    await alertOnSlack('imp', slackMsg);
  }
  return transaction;
};

const findTransactionByTrackId = async (track_id: string) => {
  const transaction = await Transaction.findOne({ where: { track_id } });
  return transaction;
};

const findTransactionsByUserId = async (userId: number) => {
  const transaction = await Transaction.find({ where: { user: { id: userId } } });
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

  let slackMsg = '';
  let smsMsg = '';

  if (transactionObj) {
    let packageTitle = transactionObj.package_title || '';
    packageTitle = packageTitle.slice(0, -1);

    switch (packageTitle) {
      case 'agent':
        slackMsg = `Payment ${status === 'completed' ? 'successful. Subscription started.' : 'failed.'}\n\n ${
          transactionObj?.user?.phone
            ? `User: <https://wa.me/965${transactionObj?.user?.phone}|${transactionObj?.user?.phone}>`
            : ''
        }`;
        smsMsg = `Payment ${status === 'completed' ? 'successful. Subscription started.' : 'failed.'}`;
        break;
      case 'stickyDirec':
        slackMsg = `Payment ${status === 'completed' ? 'successful. Post sticked.' : 'failed.'}\n\n ${
          transactionObj?.user?.phone
            ? `User: <https://wa.me/965${transactionObj?.user?.phone}|${transactionObj?.user?.phone}>`
            : ''
        }`;
        smsMsg = `Payment ${status === 'completed' ? 'successful. Post sticked.' : 'failed.'}`;
        break;
      default:
        slackMsg = `Payment ${status === 'completed' ? 'successful.' : 'failed.'}\n\n ${
          transactionObj?.user?.phone
            ? `User: <https://wa.me/965${transactionObj?.user?.phone}|${transactionObj?.user?.phone}>`
            : ''
        }`;
        smsMsg = `Payment ${status === 'completed' ? 'successful.' : 'failed.'}`;
        break;
    }
  }

  await alertOnSlack('imp', slackMsg);
  await sendSms(transactionObj.user.phone, smsMsg);
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

  const slackMsg = `Payment canceled.\n\n${
    transaction?.user?.phone ? `User: <https://wa.me/965${transaction?.user?.phone}|${transaction?.user?.phone}>` : ''
  }`;
  const smsMsg = `Payment canceled`;

  await alertOnSlack('imp', slackMsg);
  await sendSms(transaction.user.phone, smsMsg);
  return { status: 200 };
};

const filterTransactionsForAdmin = async (
  statusToFilter: string,
  typeToFilter: string,
  fromCreationDateToFilter: Date | undefined,
  toCreationDateToFilter: Date | undefined,
  userId: string,
) => {
  const where: any = {};

  if (userId) {
    where.user = { id: parseInt(userId, 10) };
  }

  if (statusToFilter && statusToFilter !== '-') where.status = statusToFilter.toLowerCase();
  if (typeToFilter && typeToFilter !== '-') {
    switch (typeToFilter) {
      case 'Regular':
        where.package_title = Like('regular%');
        break;
      case 'Sticky':
        where.package_title = Like('sticky%');
        break;
      case 'Sticky Direct':
        where.package_title = 'stickyDirect';
        break;
      case 'Agent':
        where.package_title = Like('agent%');
        break;
      default:
        break;
    }
  }

  if (fromCreationDateToFilter && toCreationDateToFilter)
    where.created_at = Between(fromCreationDateToFilter, toCreationDateToFilter);
  else if (fromCreationDateToFilter) where.created_at = MoreThanOrEqual(fromCreationDateToFilter);
  else if (toCreationDateToFilter) where.created_at = LessThanOrEqual(toCreationDateToFilter);

  const transactions = await Transaction.find({ where, order: { created_at: 'desc' } });

  return transactions;
};

export {
  saveTransaction,
  editTransaction,
  editTransactionStatus,
  findTransactionsByUserId,
  filterTransactionsForAdmin,
};
