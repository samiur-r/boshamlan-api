/* eslint-disable no-param-reassign */
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
    log.publish_date = log.created_at.toISOString().slice(0, 10);
  });
  const totalPages = Math.ceil(count / 10);
  const response = { logs, totalPages };

  return response;
};

const fetchLogsByUser = async (user: string, offset: number) => {
  const [logs, count]: any = await UserLog.findAndCount({
    where: { user },
    order: { created_at: 'DESC' },
    skip: offset,
    take: 10,
  });

  logs?.forEach((log: { publish_date: any; created_at: { toISOString: () => string | any[] } }) => {
    log.publish_date = log.created_at.toISOString().slice(0, 10);
  });

  const totalPages = Math.ceil(count / 10);
  const response = { logs, totalPages };

  return response;
};

export { saveUserLog, fetchLogsByPostId, fetchLogsByUser };
