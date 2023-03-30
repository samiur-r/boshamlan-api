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

const fetchLogsByPostId = async (postId: number) => {
  const logs: any = await UserLog.find({ where: { post_id: postId }, order: { created_at: 'DESC' } });

  logs?.forEach((log: { publish_date: any; created_at: { toISOString: () => string | any[] } }) => {
    log.publish_date = log.created_at.toISOString().slice(0, 10);
  });

  return logs;
};

const fetchLogsByUser = async (user: string) => {
  const logs: any = await UserLog.find({ where: { user }, order: { created_at: 'DESC' } });

  logs?.forEach((log: { publish_date: any; created_at: { toISOString: () => string | any[] } }) => {
    log.publish_date = log.created_at.toISOString().slice(0, 10);
  });

  return logs;
};

export { saveUserLog, fetchLogsByPostId, fetchLogsByUser };
