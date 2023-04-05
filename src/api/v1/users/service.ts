import { Between, Equal, In, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';
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

const findUnVerifiedUsers = async () => {
  const lessThanFiveMins = new Date(Date.now() - 1 * 60 * 1000); // 5 minutes ago
  const users = await User.find({ where: { status: 'not_verified', created_at: MoreThan(lessThanFiveMins) } });
  return users;
};

const filterUsersForAdmin = async (
  statusToFilter: string | number,
  phoneToFilter: string,
  adminCommentToFilter: string,
  fromCreationDateToFilter: Date | null,
  toCreationDateToFilter: Date | null,
  offset: number,
) => {
  const where: any = {};

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
        where.credits = { regular: MoreThan(0) };
        break;
      case 'Has Sticky Credits':
        where.credits = { sticky: MoreThan(0) };
        break;
      case 'Has Agent Credits':
        where.credits = { agent: MoreThan(0) };
        break;
      case 'Zero Free':
        where.credits = { free: Equal(0) };
        break;
      default:
        break;
    }
  }

  if (phoneToFilter) where.phone = phoneToFilter;
  if (adminCommentToFilter) where.admin_comment = adminCommentToFilter;
  if (fromCreationDateToFilter && toCreationDateToFilter)
    where.created_at = Between(fromCreationDateToFilter, toCreationDateToFilter);
  else if (fromCreationDateToFilter) where.created_at = MoreThanOrEqual(fromCreationDateToFilter);
  else if (toCreationDateToFilter) where.created_at = LessThanOrEqual(toCreationDateToFilter);

  const [users, count] = await User.findAndCount({
    where,
    take: 10,
    skip: offset,
    relations: ['posts', 'archive_posts', 'deleted_posts', 'credits', 'transactions'],
  });

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
};
