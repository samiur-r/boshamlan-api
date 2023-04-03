import { Between, MoreThan } from 'typeorm';
import { Credit } from '../credits/model';
import { ArchivePost } from '../posts/models/ArchivePost';
import { DeletedPost } from '../posts/models/DeletedPost';
import { Post } from '../posts/models/Post';
import { findArchivedPostByUserId, findPostByUserId } from '../posts/service';
import { ITransaction } from '../transactions/interfaces';
import { Transaction } from '../transactions/model';
import { User } from '../users/model';
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

const getUserSummary = async () => {
  const [users, totalUsers] = await User.findAndCount();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);

  const verifiedToday = users.filter(
    (user) => user.status === 'verified' && user.created_at.toISOString().slice(0, 10) === today,
  ).length;
  const verifiedYesterday = users.filter(
    (user) => user.status === 'verified' && user.created_at.toISOString().slice(0, 10) === yesterday,
  ).length;
  const notVerifiedToday = users.filter(
    (user) => user.status === 'not_verified' && user.created_at.toISOString().slice(0, 10) === today,
  ).length;
  const notVerifiedYesterday = users.filter(
    (user) => user.status === 'not_verified' && user.created_at.toISOString().slice(0, 10) === yesterday,
  ).length;

  return { totalUsers, verifiedToday, verifiedYesterday, notVerifiedToday, notVerifiedYesterday };
};

const getPostSummary = async () => {
  const [posts, totalActivePosts] = await Post.findAndCount();
  const totalArchivedPosts = await ArchivePost.count();
  const totalDeletedPosts = await DeletedPost.count();

  const totalPosts = totalActivePosts + totalArchivedPosts + totalDeletedPosts;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);

  const postsToday = posts.filter((post) => post.created_at.toISOString().slice(0, 10) === today).length;
  const postsYesterday = posts.filter((post) => post.created_at.toISOString().slice(0, 10) === yesterday).length;
  const postsByAgentToday =
    postsToday === 0
      ? 0
      : (
          (posts.filter((post) => post.user.is_agent && post.created_at.toISOString().slice(0, 10) === today).length /
            postsToday) *
          100
        ).toFixed(2);
  const postsByAgentYesterday =
    postsYesterday === 0
      ? 0
      : (
          (posts.filter((post) => post.user.is_agent && post.created_at.toISOString().slice(0, 10) === yesterday)
            .length /
            postsYesterday) *
          100
        ).toFixed(2);
  const totalActiveStickyPosts = posts.filter((post) => post.is_sticky).length;
  const totalActiveAgentPosts =
    totalActivePosts === 0
      ? 0
      : ((posts.filter((post) => post.user.is_agent).length / totalActivePosts) * 100).toFixed(2);

  return {
    totalPosts,
    totalActivePosts,
    totalArchivedPosts,
    totalDeletedPosts,
    postsToday,
    postsYesterday,
    postsByAgentToday,
    postsByAgentYesterday,
    totalActiveStickyPosts,
    totalActiveAgentPosts,
  };
};

const getTransactionSummary = async () => {
  const transactions = await Transaction.find();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);

  // Get the current month's and previous month's start and end dates
  const now = new Date();
  const currentMonthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const prevMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0);

  const transactionsToday = transactions.filter(
    (transaction) => transaction.status === 'completed' && transaction.created_at.toISOString().slice(0, 10) === today,
  );
  const transactionsYesterday = transactions.filter(
    (transaction) =>
      transaction.status === 'completed' && transaction.created_at.toISOString().slice(0, 10) === yesterday,
  );

  const completedTransactionsToday = transactionsToday.length;
  const completedTransactionsYesterday = transactionsYesterday.length;

  const totalTransactionsToday = transactions.filter(
    (transaction) => transaction.created_at.toISOString().slice(0, 10) === today,
  ).length;
  const totalTransactionsYesterday = transactions.filter(
    (transaction) => transaction.created_at.toISOString().slice(0, 10) === yesterday,
  ).length;

  const incomeToday = transactionsToday.reduce((sum, transaction) => sum + transaction.amount, 0);
  const incomeYesterday = transactionsYesterday.reduce((sum, transaction) => sum + transaction.amount, 0);

  const transactionsLastTwoMonths = await Transaction.find({
    where: [
      { created_at: Between(prevMonthStartDate, prevMonthEndDate) },
      { created_at: Between(currentMonthStartDate, currentMonthEndDate) },
    ],
  });

  const totalIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalRegularIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (
      curr.created_at >= currentMonthStartDate &&
      curr.created_at <= currentMonthEndDate &&
      (curr.package.id === 1 || curr.package.id === 2)
    ) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalRegularIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (
      curr.created_at >= prevMonthStartDate &&
      curr.created_at <= prevMonthEndDate &&
      (curr.package.id === 1 || curr.package.id === 2)
    ) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalStickyIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (
      curr.created_at >= currentMonthStartDate &&
      curr.created_at <= currentMonthEndDate &&
      (curr.package.id === 5 || curr.package.id === 5)
    ) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalStickyIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (
      curr.created_at >= prevMonthStartDate &&
      curr.created_at <= prevMonthEndDate &&
      (curr.package.id === 5 || curr.package.id === 5)
    ) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalStickyDirectIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate && curr.package.id === 7) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalStickyDirectIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate && curr.package.id === 7) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalAgentTwoIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate && curr.package.id === 3) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalAgentTwoIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate && curr.package.id === 3) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalAgentSixIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate && curr.package.id === 4) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  const totalAgentSixIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
    if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate && curr.package.id === 4) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  return {
    completedTransactionsToday,
    completedTransactionsYesterday,
    totalTransactionsToday,
    totalTransactionsYesterday,
    incomeToday,
    incomeYesterday,
    totalIncomeThisMonth,
    totalIncomeLastMonth,
    totalRegularIncomeThisMonth,
    totalRegularIncomeLastMonth,
    totalStickyIncomeThisMonth,
    totalStickyIncomeLastMonth,
    totalStickyDirectIncomeThisMonth,
    totalStickyDirectIncomeLastMonth,
    totalAgentTwoIncomeThisMonth,
    totalAgentTwoIncomeLastMonth,
    totalAgentSixIncomeThisMonth,
    totalAgentSixIncomeLastMonth,
  };
};

const geCreditsSummary = async () => {
  const totalZeroFreeCredits = await Credit.count({ where: { free: 0 } });
  const totalRegularCredits = await Credit.count({ where: { regular: MoreThan(0) } });
  const totalStickyCredits = await Credit.count({ where: { sticky: MoreThan(0) } });
  const totalAgentCredits = await Credit.count({ where: { agent: MoreThan(0) } });

  return { totalZeroFreeCredits, totalRegularCredits, totalStickyCredits, totalAgentCredits };
};

export {
  saveAdmin,
  findAdminByPhone,
  getPaymentHistory,
  getPostHistory,
  getUserSummary,
  getPostSummary,
  getTransactionSummary,
  geCreditsSummary,
};
