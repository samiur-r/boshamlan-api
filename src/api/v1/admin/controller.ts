import { NextFunction, Request, Response } from 'express';

import { hashPassword, verifyToken } from '../../../utils/passwordUtils';
import logger from '../../../utils/logger';
import { findAdminByPhone, saveAdmin } from './service';
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
import { findUserById } from '../users/service';
import { fetchLogsByPostId, fetchLogsByUser } from '../user_logs/service';
import { UserLog } from '../user_logs/model';

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

export { register, login, logout, filterPosts, stickPost, deletePost, fetchLogs };
