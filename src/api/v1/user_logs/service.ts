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

export { saveUserLog };
