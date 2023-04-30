/* eslint-disable no-param-reassign */
import e from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';
import { getLocaleDate } from '../../../utils/timestampUtls';
import { IUser } from '../users/interfaces';
import { findUserById, findUserByPhone } from '../users/service';
import { UserLog } from './model';

const saveUserLog = async (
  logs: Array<{
    post_id: number | undefined;
    transaction: string | undefined;
    user: string | undefined;
    activity: string;
  }>,
) => {
  const newPostLogs = logs.map((log) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { post_id, user, transaction, activity } = log;
    return UserLog.create({ post_id, transaction, user, activity });
  });
  await UserLog.save(newPostLogs);
};

const fetchLogsByPostId = async (postId: number, offset: number) => {
  const [logs, count]: any = await UserLog.findAndCount({
    where: { post_id: postId },
    order: { created_at: 'DESC' },
    skip: offset,
    take: 10,
  });

  logs?.forEach((log: { publish_date: any; created_at: { toISOString: () => string | any[] } }) => {
    log.publish_date = getLocaleDate(log.created_at);
  });
  const totalPages = Math.ceil(count / 10);
  const response = { logs, totalPages, totalResults: count };

  return response;
};

const fetchLogsByUser = async (user: string, offset: number) => {
  let userObj: IUser | null;
  if (user.length < 8) {
    userObj = await findUserById(parseInt(user, 10));
  } else {
    userObj = await findUserByPhone(user);
  }

  if (!userObj) throw new ErrorHandler(401, 'User not found for the log');
  const [logs, count]: any = await UserLog.findAndCount({
    where: [{ user: userObj.phone }, { user: userObj.id.toString() }],
    order: { created_at: 'DESC' },
    skip: offset,
    take: 10,
  });

  logs?.forEach((log: { publish_date: any; created_at: { toISOString: () => string | any[] } }) => {
    log.publish_date = getLocaleDate(log.created_at);
  });

  const totalPages = Math.ceil(count / 10);
  const response = { logs, totalPages, totalResults: count };

  return response;
};

export { saveUserLog, fetchLogsByPostId, fetchLogsByUser };
