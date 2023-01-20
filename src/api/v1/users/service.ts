import { User } from './model';

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

export { findUserByPhone, saveUser };
