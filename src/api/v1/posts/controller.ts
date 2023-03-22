/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';

import logger from '../../../utils/logger';
import { findUserById } from '../users/service';
import { findCreditByUserId, typeOfCreditToDeduct, updateCredit } from '../credits/service';
import { postSchema } from './validation';
import { IPost } from './interfaces';
import {
  findArchivedPostById,
  findArchivedPostByUserId,
  findPostById,
  findPosts,
  removeArchivedPost,
  removePost,
  removePostMedia,
  saveDeletedPost,
  savePost,
  saveTempPost,
  updatePost,
  updatePostRepostVals,
  updatePostStickyVal,
  updatePostViewCount,
} from './service';
import { IUser } from '../users/interfaces';
import { uploadMediaToCloudinary } from '../../../utils/cloudinaryUtils';
import { alertOnSlack } from '../../../utils/slackUtils';
import { sendSms } from '../../../utils/smsUtils';

const fetchOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await findPostById(parseInt(req.params.id, 10));

    if (!post) throw new ErrorHandler(404, 'Post not found');

    return res.status(200).json({ success: post });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchMany = async (req: Request, res: Response, next: NextFunction) => {
  const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 10;
  const offset = req.query?.offset ? parseInt(req.query.offset as string, 10) : undefined;
  // eslint-disable-next-line no-nested-ternary
  const userId = res?.locals?.user?.payload?.id
    ? res.locals.user.payload.id
    : req.query?.userId
    ? parseInt(req.query?.userId as string, 10)
    : undefined;

  try {
    const { posts, count } = await findPosts(limit, offset, userId);
    return res.status(200).json({ posts, totalPosts: count });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchManyArchive = async (req: Request, res: Response, next: NextFunction) => {
  const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 10;
  const offset = req.query?.offset ? parseInt(req.query.offset as string, 10) : undefined;
  const userId = res.locals.user.payload.id;

  try {
    const resPosts = await findArchivedPostByUserId(limit, offset, userId);
    return res.status(200).json({ posts: resPosts.archivePosts });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const insert = async (req: Request, res: Response, next: NextFunction) => {
  const { postInfo } = req.body;
  const userId = res.locals.user.payload.id;
  const media: string[] = [];

  postInfo.title = `${postInfo.propertyTitle} ل${postInfo.categoryTitle} في ${postInfo.cityTitle}`;
  postInfo.isStickyPost = postInfo.isStickyPost === 'true';
  const endpoint = req.originalUrl.substring(13, req.originalUrl.length);
  const isTempPost = endpoint === 'temp';

  try {
    await postSchema.validate(postInfo);
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    if (isTempPost) {
      if (postInfo?.multimedia && postInfo?.multimedia.length) {
        for (const multimedia of postInfo.multimedia) {
          const url = await uploadMediaToCloudinary(multimedia, 'posts');
          if (url) media.push(url);
        }
      }
      postInfo.media = media;
      const typeOfCredit = 'sticky';
      await saveTempPost(postInfo, user, typeOfCredit);
    } else {
      const { typeOfCredit, credit } = await typeOfCreditToDeduct(user.id, user.is_agent, postInfo.isStickyPost);
      if (!typeOfCredit) throw new ErrorHandler(402, 'You do not have enough credit');

      if (postInfo?.multimedia && postInfo?.multimedia.length) {
        for (const multimedia of postInfo.multimedia) {
          const url = await uploadMediaToCloudinary(multimedia, 'posts');
          if (url) media.push(url);
        }
      }

      postInfo.media = media;

      await savePost(postInfo, user, typeOfCredit);
      await updateCredit(userId, typeOfCredit, 1, 'SUB', credit);
      if (typeOfCredit === 'free' && credit.free === 1) {
        const slackMsg = `User consumed their free credits\n\n ${
          user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''
        }`;
        await alertOnSlack('imp', slackMsg);
        await sendSms(user.phone, 'You have consumed all of your free credits');
      }
      if (typeOfCredit === 'agent' && credit.agent === 1) {
        const slackMsg = `Agent credit is now 0\n\n ${
          user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''
        }`;
        await alertOnSlack('imp', slackMsg);
        await sendSms(user.phone, 'Your agent credit is now 0');
      }
    }

    return res.status(200).json({ success: 'Post created successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    const slackMsg = `Failed to create post\n\n ${
      postInfo?.phone ? `User: <https://wa.me/965${postInfo?.phone}|${postInfo?.phone}>` : ''
    }`;
    await alertOnSlack('non-imp', slackMsg);
    return next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { postInfo, postId } = req.body;
  const media: string[] = [];

  try {
    if (!postId) throw new ErrorHandler(404, 'Post not found');
    await postSchema.validate(postInfo);
    await removePostMedia(postId);

    if (postInfo?.multimedia && postInfo?.multimedia.length) {
      for (const multimedia of postInfo.multimedia) {
        const url = await uploadMediaToCloudinary(multimedia, 'posts');
        if (url) media.push(url);
      }
    }
    postInfo.media = media;

    await updatePost(postInfo, postId);

    return res.status(200).json({ success: 'Post Updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    return next(error);
  }
};

const updatePostToStick = async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user.payload.id;
  const { postId } = req.body;

  try {
    if (!postId) throw new ErrorHandler(404, 'Invalid payload passed');
    const credit = await findCreditByUserId(userId);
    if (!credit) throw new ErrorHandler(500, 'Something went wrong');

    if (credit.sticky < 1) throw new ErrorHandler(402, 'You do not have enough credit');

    const post = await findPostById(parseInt(postId, 10));
    if (!post) throw new ErrorHandler(500, 'Something went wrong');
    if (post.is_sticky) throw new ErrorHandler(304, 'Post is already sticky');

    const user = await findUserById(userId);

    await updatePostStickyVal(post, true);

    let creditType = post.credit_type;
    if (creditType === 'agent' && !user?.is_agent) creditType = 'regular';
    const updatedCredit = await updateCredit(userId, post.credit_type, 1, 'ADD', credit);
    await updateCredit(userId, 'sticky', 1, 'SUB', updatedCredit);

    return res.status(200).json({ success: 'Post is sticked successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const rePost = async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user.payload.id;
  const { postId } = req.body;

  try {
    if (!postId) throw new ErrorHandler(404, 'Invalid payload passed');
    const post = await findArchivedPostById(postId);
    if (!post) throw new ErrorHandler(500, 'Something went wrong');

    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    const credit = await findCreditByUserId(userId);
    if (!credit) throw new ErrorHandler(500, 'Something went wrong');

    let typeOfCredit;

    if (credit.free > 0) typeOfCredit = 'free';
    else if (user.is_agent && credit.agent > 0) typeOfCredit = 'agent';
    else if (credit.regular > 0) typeOfCredit = 'regular';

    if (!typeOfCredit) throw new ErrorHandler(402, 'You do not have enough credit');

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
    };

    const newPost = await savePost(postInfo, user as IUser, typeOfCredit);
    await removeArchivedPost(post.id);
    await updateCredit(userId, typeOfCredit, 1, 'SUB', credit);
    const repostCount = post.repost_count + 1;
    await updatePostRepostVals(newPost, true, repostCount);
    return res.status(200).json({ success: 'Post is reposted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, isArchive } = req.body;
  const userId = res.locals.user.payload.id;

  try {
    if (!postId) throw new ErrorHandler(404, 'Post not found');
    let post: IPost | null;

    if (isArchive) post = await findArchivedPostById(parseInt(postId, 10));
    else post = await findPostById(parseInt(postId, 10));

    if (!post) throw new ErrorHandler(500, 'Something went wrong');
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    if (isArchive) await removeArchivedPost(post.id, post);
    else await removePost(post.id, post);

    post.media = [];

    await saveDeletedPost(post, user);
    return res.status(200).json({ success: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const increasePostCount = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.body;
  try {
    await updatePostViewCount(postId, 1);
    return res.status(200).json({ success: 'View count updates successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export {
  insert,
  update,
  fetchOne,
  fetchMany,
  updatePostToStick,
  rePost,
  deletePost,
  fetchManyArchive,
  increasePostCount,
};
