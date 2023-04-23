import { Between, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual } from 'typeorm';
import AppDataSource from '../../../db';
import { hashPassword } from '../../../utils/passwordUtils';
import { IUser } from './interfaces';
import { User } from './model';

const findUserById = async (id: number) => {
  const user = await User.findOneBy({ id });
  return user;
};

const findUserByPhone = async (phone: string) => {
  const user = await User.findOneBy({ phone });
  return user;
};

const saveUser = async (phone: string, hashedPassword: string, status: string) => {
  const newUser = User.create({
    phone,
    password: hashedPassword,
    status,
  });

  const user = await User.save(newUser);
  return user;
};

const updateUserStatus = async (id: number, status: string) => {
  const userObj = await User.findOneBy({ id });

  const user = await User.save({
    ...userObj,
    status,
  });
  return user;
};

const updateUserPassword = async (userObj: IUser, password: string) => {
  const hashedPassword = await hashPassword(password);
  await User.save({
    ...userObj,
    password: hashedPassword,
  });
};

const updateIsUserAnAgent = async (id: number, isAgent: boolean) => {
  const userObj = await User.findOneBy({ id });

  const user = await User.save({
    ...userObj,
    is_agent: isAgent,
  });
  return user;
};

const updateBulkIsUserAnAgent = async (ids: number[], status: boolean) => {
  await User.update({ id: In(ids) }, { is_agent: status });
};

const getLastActivity = (user: any) => {
  user.posts.sort(
    (a: { created_at: { getTime: () => number } }, b: { created_at: { getTime: () => number } }) =>
      a.created_at.getTime() - b.created_at.getTime(),
  );

  return user.posts[0].created_at;
};

const findUnVerifiedUsers = async () => {
  const lessThanFiveMins = new Date(Date.now() - 1 * 60 * 1000); // 5 minutes ago
  const users = await User.find({ where: { status: 'not_verified', created_at: MoreThan(lessThanFiveMins) } });
  return users;
};

const filterUsersForAdmin = async (
  statusToFilter: string | number,
  phoneToFilter: string,
  adminCommentToFilter: string,
  fromCreationDateToFilter: string | null,
  toCreationDateToFilter: string | null,
  orderByToFilter: string | undefined,
  offset: number,
) => {
  let where: any = {};
  let order = 'user.created_at';

  if (statusToFilter) {
    switch (statusToFilter) {
      case 'User':
        where.is_agent = false;
        break;
      case 'Agent':
        where.is_agent = true;
        break;
      case 'Verified':
        where.status = 'verified';
        break;
      case 'Not Verified':
        where.status = 'not_verified';
        break;
      case 'Has Regular Credits':
        where = 'credits.regular > 0';
        break;
      case 'Has Sticky Credits':
        where = 'credits.sticky > 0';
        break;
      case 'Has Agent Credits':
        where = 'credits.agent > 0';
        break;
      case 'Zero Free':
        where = `credits.free < 1 OR user.status = 'not_verified'`;
        break;
      default:
        break;
    }
  }

  if (phoneToFilter) where.phone = phoneToFilter;
  if (adminCommentToFilter) where.admin_comment = Like(`%${adminCommentToFilter}%`);

  if (fromCreationDateToFilter && toCreationDateToFilter)
    where.created_at = Between(`${fromCreationDateToFilter} 00:00:00`, `${toCreationDateToFilter} 23:59:59`);
  else if (fromCreationDateToFilter) where.created_at = MoreThanOrEqual(`${fromCreationDateToFilter} 00:00:00`);
  else if (toCreationDateToFilter) where.created_at = LessThanOrEqual(`${toCreationDateToFilter} 23:59:59`);

  if (orderByToFilter) {
    switch (orderByToFilter) {
      case 'Registered':
        order = 'user.created_at';
        break;
      case 'Total Posts':
        order = 'total_posts';
        break;
      case 'Active Posts':
        order = 'total_active_posts';
        break;
      case 'Archived Posts':
        order = 'total_archive_post';
        break;
      case 'Trashed Posts':
        order = 'total_deleted_post';
        break;
      case 'Mobile':
        order = 'user.phone';
        break;
      default:
        break;
    }
  }

  const count = await User.createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .leftJoinAndSelect('user.archive_posts', 'archive_post')
    .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
    .leftJoinAndSelect('user.credits', 'credits')
    .leftJoinAndSelect('user.transactions', 'transactions')
    .leftJoinAndSelect('user.agent', 'agent')
    .where(where)
    .getCount();

  const users = await User.createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .leftJoinAndSelect('user.archive_posts', 'archive_post')
    .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
    .leftJoinAndSelect('user.credits', 'credits')
    .leftJoinAndSelect('user.transactions', 'transactions')
    .leftJoinAndSelect('transactions.package', 'package')
    .leftJoinAndSelect('user.agent', 'agent')
    .addSelect('COUNT(post.id) + COUNT(archive_post.id) + COUNT(deleted_post.id)', 'total_posts')
    .addSelect('COUNT(post.id)', 'total_active_posts')
    .addSelect('COUNT(archive_post.id)', 'total_archive_post')
    .addSelect('COUNT(deleted_post.id)', 'total_deleted_post')
    .groupBy('user.id, post.id, archive_post.id, deleted_post.id, credits.id, transactions.id, package.id, agent.id')
    .orderBy(order, 'DESC')
    .where(where)
    .skip(offset)
    .take(10)
    .getMany();

  return { users, count };
};

const findUserWithAgentInfo = async (userId: number) => {
  const userWithAgentInfo: any = await User.findOne({
    where: { id: userId },
    relations: ['agent'],
  });

  if (userWithAgentInfo) delete userWithAgentInfo?.password;
  if (userWithAgentInfo && userWithAgentInfo.agent.length) delete userWithAgentInfo?.agent[0]?.user.password;
  return userWithAgentInfo;
};

const updateUser = async (userObj: IUser, phone: string, adminComment: string | undefined, password: string) => {
  const updatedUser = await User.save({
    ...userObj,
    phone,
    admin_comment: adminComment,
  });

  if (password) {
    await updateUserPassword(updatedUser, password);
  }
};

export {
  findUserById,
  findUserByPhone,
  saveUser,
  updateUserStatus,
  updateUserPassword,
  updateIsUserAnAgent,
  updateBulkIsUserAnAgent,
  findUnVerifiedUsers,
  filterUsersForAdmin,
  findUserWithAgentInfo,
  updateUser,
  getLastActivity,
};
