import { Between, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual } from 'typeorm';
import AppDataSource from '../../../db';
import { hashPassword } from '../../../utils/passwordUtils';
import { getLocaleDate } from '../../../utils/timestampUtls';
import { Post } from '../posts/models/Post';
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
    (a: { public_date: { getTime: () => number } }, b: { public_date: { getTime: () => number } }) =>
      b.public_date.getTime() - a.public_date.getTime(),
  );

  return user.posts[0].public_date;
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

  const today = getLocaleDate(new Date());
  const yesterday = getLocaleDate(new Date(new Date().setDate(new Date().getDate() - 1)));

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
        where = `(credits.free < 1 OR user.status = 'not_verified')`;
        break;
      case 'Active Today':
        where = `post.created_at BETWEEN '${today} 00:00:00' AND '${today} 23:59:59'`;
        break;
      case 'Active Yesterday':
        where = `post.created_at BETWEEN '${yesterday} 00:00:00' AND '${yesterday} 23:59:59'`;
        break;
      case 'Has Regular Credit History':
        where = `transactions.status = 'completed' AND (transactions.package_title = 'regular1' OR transactions.package_title = 'regular2')`;
        break;
      case 'Has Sticky Credit History':
        where = `transactions.status = 'completed' AND (transactions.package_title = 'sticky1' OR transactions.package_title = 'sticky2')`;
        break;
      case 'Has Direct Sticky Credit History':
        where = `transactions.status = 'completed' AND transactions.package_title = 'stickyDirect'`;
        break;
      case 'Has Agent History':
        where = `transactions.status = 'completed' AND (transactions.package_title = 'agent1' OR transactions.package_title = 'agent2')`;
        break;
      default:
        break;
    }
  }

  if (phoneToFilter) {
    if (typeof where === 'string') where = `${where} AND phone = ${phoneToFilter}`;
    else where.phone = phoneToFilter;
  }

  if (adminCommentToFilter) {
    if (typeof where === 'string') where = `${where} AND admin_comment LIKE '%${adminCommentToFilter}%'`;
    else where.admin_comment = Like(`%${adminCommentToFilter}%`);
  }

  if (fromCreationDateToFilter && toCreationDateToFilter) {
    if (typeof where === 'string')
      where = `${where} AND user.created_at >= '${fromCreationDateToFilter} 00:00:00' and user.created_at <= '${toCreationDateToFilter} 23:59:59'`;
    else where.created_at = Between(`${fromCreationDateToFilter} 00:00:00`, `${toCreationDateToFilter} 23:59:59`);
  } else if (fromCreationDateToFilter) {
    if (typeof where === 'string') where = `${where} AND user.created_at >= '${fromCreationDateToFilter} 00:00:00'`;
    else where.created_at = MoreThanOrEqual(`${fromCreationDateToFilter} 00:00:00`);
  } else if (toCreationDateToFilter) {
    if (typeof where === 'string') where = `${where} and user.created_at <= '${toCreationDateToFilter} 23:59:59'`;
    else where.created_at = LessThanOrEqual(`${toCreationDateToFilter} 23:59:59`);
  }

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

  let count = 0;
  let users: any = [];

  count = await User.createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .leftJoinAndSelect('user.archive_posts', 'archive_post')
    .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
    .leftJoinAndSelect('user.credits', 'credits')
    .leftJoinAndSelect('user.transactions', 'transactions')
    .leftJoinAndSelect('user.agent', 'agent')
    .where(where)
    .getCount();

  users = await User.createQueryBuilder('user')
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
    .take(50)
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
