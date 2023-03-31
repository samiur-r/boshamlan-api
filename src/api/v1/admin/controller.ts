/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import { NextFunction, Request, Response } from 'express';

import { hashPassword, verifyToken } from '../../../utils/passwordUtils';
import logger from '../../../utils/logger';
import { findAdminByPhone, getPaymentHistory, getPostHistory, saveAdmin } from './service';
import ErrorHandler from '../../../utils/ErrorHandler';
import { signJwt } from '../../../utils/jwtUtils';
import config from '../../../config';
import {
  filterPostsForAdmin,
  findArchivedPostById,
  findPostById,
  removeArchivedPost,
  removePost,
  saveDeletedPost,
  updatePostStickyVal,
} from '../posts/service';
import { filterUsersForAdmin, findUserById } from '../users/service';
import { fetchLogsByPostId, fetchLogsByUser } from '../user_logs/service';
import { UserLog } from '../user_logs/model';
import { findCreditByUserId } from '../credits/service';
import { findTransactionsByUserId } from '../transactions/service';
import { findAgentByUserId } from '../agents/service';
import { Credit } from '../credits/model';

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
  } = req.body;

  try {
    const posts = await filterPostsForAdmin(
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
    );
    return res.status(200).json({ posts });
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

const fetchLogs = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, user } = req.body;
  let logs: UserLog[] = [];

  try {
    if (postId) logs = await fetchLogsByPostId(postId);
    else if (user) logs = await fetchLogsByUser(user);
    return res.status(200).json({ logs });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

// TODO: refactor the controller so that its non blocking

const filterUsers = async (req: Request, res: Response, next: NextFunction) => {
  const {
    statusToFilter,
    phoneToFilter,
    adminCommentToFilter,
    fromCreationDateToFilter,
    toCreationDateToFilter,
    orderByToFilter,
  } = req.body;

  try {
    let users: any = await filterUsersForAdmin(
      statusToFilter,
      phoneToFilter,
      adminCommentToFilter,
      fromCreationDateToFilter,
      toCreationDateToFilter,
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      delete user?.password;
      const credits = await findCreditByUserId(user.id);
      const transactions = await findTransactionsByUserId(user.id);
      const payment = getPaymentHistory(transactions);
      const postHistory = await getPostHistory(user.id);

      if (credits) user.credits = credits;
      else user.credits = { free: 0, regular: 0, sticky: 0, agent: 0 };

      if (user.is_agent) {
        const agent = await findAgentByUserId(user.id);
        const subscription = agent
          ? `${agent.created_at.toISOString().slice(0, 10)} - ${agent.expiry_date.toISOString().slice(0, 10)}`
          : '-';
        user.subscription = subscription;
      } else user.subscription = '-';

      user.payment = payment;
      user.post = postHistory;
      user.registered = user.created_at.toISOString().slice(0, 10);
    }

    if (statusToFilter && statusToFilter === 'Has Regular Credits') {
      users = users.filter((user: { credits: { regular: number } }) => user.credits.regular > 0);
    } else if (statusToFilter && statusToFilter === 'Has Sticky Credits') {
      users = users.filter((user: { credits: { sticky: number } }) => user.credits.sticky > 0);
    } else if (statusToFilter && statusToFilter === 'Has Agent Credits') {
      users = users.filter((user: { credits: { agent: number } }) => user.credits.agent > 0);
    } else if (statusToFilter && statusToFilter === 'Zero Free') {
      users = users.filter((user: { credits: { free: number } }) => user.credits.free === 0);
    }

    if (orderByToFilter && orderByToFilter === 'Total Posts') {
      users.sort((a: { post: { total: number } }, b: { post: { total: number } }) => a.post.total > b.post.total);
    } else if (orderByToFilter && orderByToFilter === 'Active Posts') {
      users.sort((a: { post: { active: number } }, b: { post: { active: number } }) => a.post.active > b.post.active);
    } else if (orderByToFilter && orderByToFilter === 'Archived Posts') {
      users.sort(
        (a: { post: { archived: number } }, b: { post: { archived: number } }) => a.post.archived > b.post.archived,
      );
    } else if (orderByToFilter && orderByToFilter === 'Trashed Posts') {
      users.sort(
        (a: { post: { deleted: number } }, b: { post: { deleted: number } }) => a.post.deleted > b.post.deleted,
      );
    } else if (orderByToFilter && orderByToFilter === 'Registered') {
      users.sort((a: { status: string }, b: { status: string }) => {
        if (a.status === 'verified' && b.status === 'not_verified') {
          return -1;
        }
        if (a.status === 'not_verified' && b.status === 'verified') {
          return 1;
        }
        return 0;
      });
    } else if (orderByToFilter && orderByToFilter === 'Mobile') {
      users.sort((a: { phone: number }, b: { phone: number }) => {
        if (a.phone < b.phone) {
          return -1;
        }
        if (a.phone > b.phone) {
          return 1;
        }
        return 0;
      });
    }

    return res.status(200).json({ users });
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

export { register, login, logout, filterPosts, stickPost, deletePost, fetchLogs, filterUsers, updateCredit };
