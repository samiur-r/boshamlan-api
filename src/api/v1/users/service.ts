import { In } from 'typeorm';
import { hashPassword } from '../../../utils/passwordUtils';
import { IUser } from './interfaces';
import { User } from './model';

const findUserById = async (id: number) => {
  const user = await User.findOneBy({ id });
  return user;
};

const findUserByPhone = async (phone: number) => {
  const user = await User.findOneBy({ phone });
  return user;
};

const saveUser = async (phone: number, hashedPassword: string, status: string) => {
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

export {
  findUserById,
  findUserByPhone,
  saveUser,
  updateUserStatus,
  updateUserPassword,
  updateIsUserAnAgent,
  updateBulkIsUserAnAgent,
};
