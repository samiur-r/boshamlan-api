/* eslint-disable security/detect-object-injection */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import { NextFunction, Request, Response } from 'express';

import axios from 'axios';
import { hashPassword, verifyToken } from '../../../utils/passwordUtils';
import logger from '../../../utils/logger';
import {
  findAdminByPhone,
  geCreditsSummary,
  getPaymentHistory,
  getPostHistory,
  getPostSummary,
  getTransactionSummary,
  getUserSummary,
  saveAdmin,
} from './service';
import ErrorHandler from '../../../utils/ErrorHandler';
import { signJwt } from '../../../utils/jwtUtils';
import config from '../../../config';
import {
  filterPostsForAdmin,
  findArchivedPostById,
  findDeletedPostById,
  findPostById,
  removeAllPostsOfUser,
  removeArchivedPost,
  removePost,
  saveDeletedPost,
  savePost,
  updatePostRepostVals,
  updatePostStickyVal,
} from '../posts/service';
import {
  filterUsersForAdmin,
  findUserById,
  findUserWithAgentInfo,
  updateUser,
  updateUserStatus,
} from '../users/service';
import { fetchLogsByPostId, fetchLogsByUser } from '../user_logs/service';
import { findCreditByUserId, initCredits, setCreditsToZeroByUserId } from '../credits/service';
import { filterTransactionsForAdmin, findTransactionsByUserId } from '../transactions/service';
import { findAgentById, findAgentByUserId } from '../agents/service';
import { Credit } from '../credits/model';
import { Agent } from '../agents/model';
import { sendSms } from '../../../utils/smsUtils';
import { IPost } from '../posts/interfaces';
import { ITransaction } from '../transactions/interfaces';
import sortFunctions from '../../../utils/sortUsersFunctions';
import { User } from '../users/model';
import { getSocketIo } from '../../../utils/socketIO';
import { DeletedPost } from '../posts/models/DeletedPost';
import { updateLocationCountValue } from '../locations/service';
import { parseTimestamp } from '../../../utils/timestampUtls';

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password, name } = req.body;

  try {
    const hashedPassword = await hashPassword(password);

    await saveAdmin(phone, hashedPassword, name);
    return res.status(200).json({ success: 'New admin created successfully' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body;

  try {
    const admin = await findAdminByPhone(phone);
    if (!admin) throw new ErrorHandler(403, 'Incorrect phone or password');

    const isValidPassword = await verifyToken(password, admin.password);
    if (!isValidPassword) throw new ErrorHandler(403, 'Incorrect phone or password');

    const adminPayload = {
      id: admin.id,
      phone: admin.phone,
      name: admin.name,
      is_super: admin.is_super,
      admin_status: true,
    };

    const token = await signJwt(adminPayload);

    // @ts-ignore
    res.cookie('token', token, config.cookieOptions);
    return res.status(200).json({ success: adminPayload });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ success: 'Logged out successfully' });
};

const filterPosts = async (req: Request, res: Response, next: NextFunction) => {
  const {
    locationToFilter,
    categoryToFilter,
    propertyTypeToFilter,
    fromPriceToFilter,
    toPriceToFilter,
    fromCreationDateToFilter,
    toCreationDateToFilter,
    stickyStatusToFilter,
    userTypeToFilter,
    orderByToFilter,
    postStatusToFilter,
    userId,
    offset,
  } = req.body;
  try {
    const { posts, totalPages } = await filterPostsForAdmin(
      locationToFilter,
      categoryToFilter,
      propertyTypeToFilter,
      fromPriceToFilter,
      toPriceToFilter,
      fromCreationDateToFilter,
      toCreationDateToFilter,
      stickyStatusToFilter,
      userTypeToFilter,
      orderByToFilter,
      postStatusToFilter,
      userId,
      offset,
    );
    return res.status(200).json({ posts, totalPages });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const stickPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.body;
  const user = res.locals.user.payload;

  try {
    const post = await findPostById(parseInt(postId, 10));
    if (!post) throw new ErrorHandler(401, 'Post not found');
    if (post.is_sticky) throw new ErrorHandler(304, 'Post is already sticky');

    await updatePostStickyVal(post, true);
    logger.info(`Post ${post.id} sticked by user ${user?.phone}`);
    return res.status(200).json({ success: 'Post is sticked successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} stick attempt by user ${user?.phone}} failed`);
    return next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, isArchive } = req.body;
  const userObj = res.locals.user.payload;

  try {
    if (!postId) throw new ErrorHandler(404, 'Post not found');
    let post: any;

    if (isArchive) post = await findArchivedPostById(parseInt(postId, 10));
    else post = await findPostById(parseInt(postId, 10));

    if (!post) throw new ErrorHandler(401, 'Post not found');

    const user = await findUserById(post.user.id);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    if (isArchive) await removeArchivedPost(post.id, post);
    else await removePost(post.id, post);

    await updateLocationCountValue(post.city_id, 'decrement');

    post.media = [];

    await saveDeletedPost(post, user);
    logger.info(`Post ${postId} deleted by user ${userObj.phone}`);
    return res.status(200).json({ success: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} delete attempt by user ${userObj.phone} failed`);
    return next(error);
  }
};

const deletePostPermanently = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.body;
  const userObj = res.locals.user.payload;

  try {
    if (!postId) throw new ErrorHandler(404, 'Post not found');

    await removePost(postId);
    await removeArchivedPost(postId);
    await DeletedPost.delete({ id: postId });
    logger.info(`Post ${postId} permanently deleted by user ${userObj.phone}`);
    return res.status(200).json({ success: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} permanently delete attempt by user ${userObj.phone} failed`);
    return next(error);
  }
};

const rePost = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;
  const { postId } = req.body;

  try {
    if (!postId) throw new ErrorHandler(404, 'Invalid payload passed');
    let post;

    post = await findArchivedPostById(postId);

    if (post) await removeArchivedPost(post.id);
    else post = await findDeletedPostById(postId);

    if (post) await DeletedPost.delete({ id: postId });
    else throw new ErrorHandler(404, 'Post not found');

    const publicDate = post.public_date;

    const postInfo = {
      title: post.title,
      cityId: post.city_id,
      cityTitle: post.city_title,
      stateId: post.state_id,
      stateTitle: post.state_title,
      propertyId: post.property_id,
      propertyTitle: post.property_title,
      categoryId: post.category_id,
      categoryTitle: post.category_title,
      price: post.price,
      description: post.description,
      media: post.media,
      sticked_date: post.sticked_date,
      repost_count: post.repost_count + 1,
      views: post.views,
    };

    const newPost = await savePost(postInfo, post.user, 'regular', publicDate);
    const repostCount = post.repost_count + 1;
    await updatePostRepostVals(newPost, true, repostCount);
    await updateLocationCountValue(post.city_id, 'increment');

    logger.info(`Post ${post.id} reposted by user ${user?.phone}`);
    return res.status(200).json({ success: 'Post is reposted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} repost by user ${user.phone} failed`);
    return next(error);
  }
};

const fetchLogs = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, user, offset } = req.body;
  let response: any;

  try {
    if (postId) response = await fetchLogsByPostId(postId, offset);
    else if (user) response = await fetchLogsByUser(user, offset);
    return res.status(200).json({ logs: response.logs, totalPages: response.totalPages });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const filterUsers = async (req: Request, res: Response, next: NextFunction) => {
  const {
    statusToFilter,
    phoneToFilter,
    adminCommentToFilter,
    fromCreationDateToFilter,
    toCreationDateToFilter,
    orderByToFilter,
    offset,
  } = req.body;
  let totalPages = null;

  try {
    const { users, count }: any = await filterUsersForAdmin(
      statusToFilter,
      phoneToFilter,
      adminCommentToFilter,
      fromCreationDateToFilter,
      toCreationDateToFilter,
      offset,
    );

    totalPages = Math.ceil(count / 10);

    const parsedUsers = users.map((user: any) => ({
      id: user.id,
      phone: user.phone,
      status: user.status,
      is_agent: user.is_agent,
      adminComment: user.admin_comment,
      is_blocked: user.is_blocked,
      registeredDate: parseTimestamp(user.created_at).parsedDate,
      registeredTime: parseTimestamp(user.created_at).parsedTime,
      subscriptionStartDate:
        user.agent && user.agent.length && user?.agent[0]?.subscription_start_date
          ? parseTimestamp(user.agent[0].subscription_start_date).parsedDate
          : null,
      subscriptionStartTime:
        user.agent && user.agent.length && user?.agent[0]?.subscription_start_date
          ? parseTimestamp(user.agent[0].subscription_start_date).parsedTime
          : null,
      subscriptionEndsDate:
        user.agent && user.agent.length && user?.agent[0]?.subscription_ends_date
          ? parseTimestamp(user.agent[0].subscription_ends_date).parsedDate
          : null,
      subscriptionEndsTime:
        user.agent && user.agent.length && user?.agent[0]?.subscription_ends_date
          ? parseTimestamp(user.agent[0].subscription_ends_date).parsedTime
          : null,
      post: {
        active: user.posts?.length,
        repost: user.posts.filter((post: IPost) => post.is_reposted).length,
        archived: user.archive_posts?.length,
        deleted: user.deleted_posts?.length,
      },
      credits: {
        free: user?.credits[0]?.free ?? 0,
        regular: user?.credits[0]?.regular ?? 0,
        sticky: user?.credits[0]?.sticky ?? 0,
        agent: user?.credits[0]?.agent ?? 0,
      },
      payment: {
        regular: user?.transactions
          .filter((transaction: ITransaction) => ['regular1', 'regular2'].includes(transaction.package_title))
          .reduce((total: number, transaction: ITransaction) => total + transaction.amount, 0),
        sticky: user.transactions
          .filter((transaction: ITransaction) => ['sticky1', 'sticky2'].includes(transaction.package_title))
          .reduce((total: number, transaction: ITransaction) => total + transaction.amount, 0),
        agent: user.transactions
          .filter((transaction: ITransaction) => ['agent1', 'agent2'].includes(transaction.package_title))
          .reduce((total: number, transaction: ITransaction) => total + transaction.amount, 0),
      },
    }));

    if (orderByToFilter && sortFunctions[orderByToFilter as keyof typeof sortFunctions]) {
      parsedUsers.sort(sortFunctions[orderByToFilter as keyof typeof sortFunctions]);
    }

    return res.status(200).json({ users: parsedUsers, totalPages });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  try {
    const user: any = await User.findOne({
      where: { id: userId },
      relations: ['posts', 'archive_posts', 'deleted_posts', 'credits', 'transactions', 'agent'],
    });
    delete user?.password;

    const parsedUser = {
      id: user.id,
      phone: user.phone,
      status: user.status,
      is_agent: user.is_agent,
      adminComment: user.admin_comment,
      is_blocked: user.is_blocked,
      registeredDate: parseTimestamp(user.created_at).parsedDate,
      registeredTime: parseTimestamp(user.created_at).parsedTime,
      subscriptionStartDate:
        user.agent && user.agent.length && user?.agent[0]?.subscription_start_date
          ? parseTimestamp(user.agent[0].subscription_start_date).parsedDate
          : null,
      subscriptionStartTime:
        user.agent && user.agent.length && user?.agent[0]?.subscription_start_date
          ? parseTimestamp(user.agent[0].subscription_start_date).parsedTime
          : null,
      subscriptionEndsDate:
        user.agent && user.agent.length && user?.agent[0]?.subscription_ends_date
          ? parseTimestamp(user.agent[0].subscription_ends_date).parsedDate
          : null,
      subscriptionEndsTime:
        user.agent && user.agent.length && user?.agent[0]?.subscription_ends_date
          ? parseTimestamp(user.agent[0].subscription_ends_date).parsedTime
          : null,
      post: {
        active: user.posts?.length,
        repost: user.posts?.filter((post: IPost) => post.is_reposted).length,
        archived: user.archive_posts?.length,
        deleted: user.deleted_posts?.length,
      },
      credits: {
        free: user?.credits[0]?.free ?? 0,
        regular: user?.credits[0]?.regular ?? 0,
        sticky: user?.credits[0]?.sticky ?? 0,
        agent: user?.credits[0]?.agent ?? 0,
      },
      payment: {
        regular: user?.transactions
          .filter((transaction: ITransaction) => ['regular1', 'regular2'].includes(transaction.package_title))
          .reduce((total: number, transaction: ITransaction) => total + transaction.amount, 0),
        sticky: user?.transactions
          .filter((transaction: ITransaction) => ['sticky1', 'sticky2'].includes(transaction.package_title))
          .reduce((total: number, transaction: ITransaction) => total + transaction.amount, 0),
        agent: user?.transactions
          .filter((transaction: ITransaction) => ['agent1', 'agent2'].includes(transaction.package_title))
          .reduce((total: number, transaction: ITransaction) => total + transaction.amount, 0),
      },
    };

    return res.status(200).json({ user: parsedUser });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const updateCredit = async (req: Request, res: Response, next: NextFunction) => {
  const { creditAmount, creditType, userId } = req.body;

  try {
    const credit = await findCreditByUserId(userId);
    if (!credit) throw new ErrorHandler(401, 'Credit record not found');

    await Credit.save({
      ...credit,
      [creditType]: creditAmount,
    });
    return res.status(200).json({ success: 'Credit updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchUserWithAgentInfo = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  try {
    const user = await findUserWithAgentInfo(userId);
    if (!user) throw new ErrorHandler(401, 'User not found');
    return res.status(200).json({ user });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const editUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id, phone, adminComment, password } = req.body;

  try {
    const user = await findUserById(id);
    if (!user) throw new ErrorHandler(401, 'User not found');

    await updateUser(user, phone, adminComment, password);

    return res.status(200).json({ success: 'User updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const editAgent = async (req: Request, res: Response, next: NextFunction) => {
  const { agentId, name, email, instagram, facebook, twitter, website, description } = req.body;

  try {
    if (!agentId || !name) throw new ErrorHandler(404, 'Invalid agent id or name');
    const agent = await findAgentById(agentId);
    if (!agent) throw new ErrorHandler(401, 'Agent not found');

    const agentData = Agent.create({
      ...agent,
      name,
      email,
      instagram,
      facebook,
      twitter,
      website,
      description,
    });

    await Agent.save(agentData);

    return res.status(200).json({ success: 'Agent updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  try {
    if (!userId) throw new ErrorHandler(404, 'Invalid agent id or name');
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(401, 'Agent not found');

    await updateUserStatus(userId, 'verified');
    await initCredits(user);
    await sendSms(user.phone, 'Congratulations! you have been registered successfully');

    return res.status(200).json({ success: 'User verified successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchTransactions = async (req: Request, res: Response, next: NextFunction) => {
  const { statusToFilter, typeToFilter, fromCreationDateToFilter, toCreationDateToFilter, userId, offset } = req.body;

  try {
    const { transactions, totalPages } = await filterTransactionsForAdmin(
      statusToFilter,
      typeToFilter,
      fromCreationDateToFilter,
      toCreationDateToFilter,
      userId,
      offset,
    );
    return res.status(200).json({ transactions, totalPages });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchDashboardInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userSummary = await getUserSummary();
    const postSummary = await getPostSummary();
    const transactionSummary = await getTransactionSummary();
    const creditSummary = await geCreditsSummary();
    return res.status(200).json({ userSummary, postSummary, transactionSummary, creditSummary });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchTestItems = async (req: Request, res: Response, next: NextFunction) => {
  const { offset } = req.body;
  try {
    let totalPages = null;
    if (offset === 0) totalPages = Math.ceil(100 / 10);
    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts?_start=${offset}&_limit=10`);
    return res.status(200).json({ totalPages, items: data });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const updateUserBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, status } = req.body;

  try {
    if (!userId) throw new ErrorHandler(404, 'Invalid user id');
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(401, 'User not found');

    if (user.is_blocked && status) throw new ErrorHandler(403, 'User is already blocked');

    if (!user.is_blocked && status === false) throw new ErrorHandler(403, 'You can not unblock a non blocked user');

    await User.save({
      ...user,
      is_agent: status ? false : user.is_agent,
      is_blocked: status,
    });

    if (status) {
      const socketIo: any = await getSocketIo();
      socketIo.emit('userBlocked', { user: user.phone });

      await removeAllPostsOfUser(userId);
      await setCreditsToZeroByUserId(userId);
    }

    return res.status(200).json({ success: `User ${status === true ? ' blocked' : ' unblocked'} successfully` });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const updateUserComment = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, adminComment } = req.body;

  try {
    if (!userId) throw new ErrorHandler(404, 'Invalid user id');
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(401, 'User not found');

    await User.save({
      ...user,
      admin_comment: adminComment && adminComment !== '' ? adminComment : null,
    });

    return res.status(200).json({ success: `User comment updated successfully` });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export {
  register,
  login,
  logout,
  filterPosts,
  stickPost,
  deletePost,
  fetchLogs,
  filterUsers,
  updateCredit,
  fetchUser,
  fetchUserWithAgentInfo,
  editUser,
  editAgent,
  verifyUser,
  fetchTransactions,
  fetchDashboardInfo,
  fetchTestItems,
  updateUserBlockStatus,
  deletePostPermanently,
  rePost,
  updateUserComment,
};
