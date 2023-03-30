import { ArchivePost } from '../posts/models/ArchivePost';
import { DeletedPost } from '../posts/models/DeletedPost';
import { Post } from '../posts/models/Post';
import { findArchivedPostByUserId, findPostByUserId } from '../posts/service';
import { ITransaction } from '../transactions/interfaces';
import { Admin } from './model';

const saveAdmin = async (phone: string, password: string, name: string) => {
  const newAdmin = Admin.create({
    phone,
    password,
    name,
  });

  await Admin.save(newAdmin);
};

const findAdminByPhone = async (phone: string) => {
  const admin = await Admin.findOneBy({ phone });
  return admin;
};

const getPaymentHistory = (transactions: ITransaction[] | null) => {
  const payment = {
    regular: 0,
    sticky: 0,
    agent: 0,
  };

  if (transactions) {
    transactions.forEach((transaction: ITransaction) => {
      if (transaction.package_title === 'regular1' || transaction.package_title === 'regular2')
        payment.regular += transaction.amount;
      else if (transaction.package_title === 'sticky1' || transaction.package_title === 'sticky2')
        payment.sticky += transaction.amount;
      else if (transaction.package_title === 'agent1' || transaction.package_title === 'agent2')
        payment.agent += transaction.amount;
    });
  }

  return payment;
};

const getPostHistory = async (userId: number) => {
  const postHistory = {
    total: 0,
    active: 0,
    archived: 0,
    repost: 0,
    deleted: 0,
  };

  const countActivePosts = await Post.count({
    where: { user: { id: userId } },
  });
  const countRepostedPosts = await Post.count({
    where: { is_reposted: true },
  });
  const countArchivedPosts = await ArchivePost.count({
    where: { user: { id: userId } },
  });
  const countDeletedPosts = await DeletedPost.count({
    where: { user: { id: userId } },
  });

  postHistory.active = countActivePosts;
  postHistory.archived = countArchivedPosts;
  postHistory.deleted = countDeletedPosts;
  postHistory.repost = countRepostedPosts;
  postHistory.total = countActivePosts + countArchivedPosts + countDeletedPosts + countRepostedPosts;

  return postHistory;
};

export { saveAdmin, findAdminByPhone, getPaymentHistory, getPostHistory };
