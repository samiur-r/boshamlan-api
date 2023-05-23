/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';

import logger from '../../../utils/logger';
import { findUserById, findUserByPhone } from '../users/service';
import { findCreditByUserId, typeOfCreditToDeduct, updateCredit } from '../credits/service';
import { postSchema } from './validation';
import { IPost } from './interfaces';
import {
  findArchivedPostById,
  findArchivedPostByUserId,
  findDeletedPostById,
  findPostById,
  findPosts,
  removeArchivedPost,
  removeDeletedPost,
  removePost,
  removePostMedia,
  saveDeletedPost,
  savePost,
  saveTempPost,
  updateArchivePost,
  updateDeletedPost,
  updatePost,
  updatePostRepostVals,
  updatePostStickyVal,
  updatePostViewCount,
} from './service';
import { IUser } from '../users/interfaces';
import { uploadMediaToCloudinary } from '../../../utils/cloudinaryUtils';
import { alertOnSlack } from '../../../utils/slackUtils';
import { sendSms } from '../../../utils/smsUtils';
import { saveUserLog } from '../user_logs/service';
import { checkAuthorization } from '../../../utils/checkAuthorization';
import { updateLocationCountValue } from '../locations/service';
import { Post } from './models/Post';
import hidePhoneNumber from '../../../utils/hidePhoneNumber';

const fetchOne = async (req: Request, res: Response, next: NextFunction) => {
  let post;
  let isActive = true;
  let inactivePostText = '';

  try {
    post = await findPostById(parseInt(req.params.id, 10));
    if (!post) {
      post = await findArchivedPostById(parseInt(req.params.id, 10));
      if (post) {
        post.phone = '';
        post.description = hidePhoneNumber(post.description);
        inactivePostText = 'This post have been archived and you can not contact the owner';
      }
      isActive = false;
    }
    if (!post) {
      post = await findDeletedPostById(parseInt(req.params.id, 10));
      if (post) {
        post.phone = '';
        post.description = hidePhoneNumber(post.description);
        inactivePostText = 'This post have been deleted and you can not contact the owner';
      }
      isActive = false;
    }
    if (!post) throw new ErrorHandler(404, 'Post not found');

    return res.status(200).json({ success: post, isActive, inactivePostText });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchOneForEdit = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals?.user?.payload;
  let post;

  try {
    post = await findPostById(parseInt(req.params.id, 10));
    if (!post) {
      post = await findArchivedPostById(parseInt(req.params.id, 10));
    }
    if (!post) {
      post = await findDeletedPostById(parseInt(req.params.id, 10));
    }
    if (!post) throw new ErrorHandler(404, 'Post not found');

    checkAuthorization(user, post.user.id);

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
  const { postInfo, isStickyOnly } = req.body;
  const userId = res.locals.user.payload.id;
  const media: string[] = [];

  postInfo.title = `${postInfo.propertyTitle} ل${postInfo.categoryTitle} في ${postInfo.cityTitle}`;
  const endpoint = req.originalUrl.substring(13, req.originalUrl.length);
  const isTempPost = endpoint === 'temp';
  const logs: Array<{
    post_id: number | undefined;
    transaction: string | undefined;
    user: string | undefined;
    activity: string;
  }> = [];

  try {
    const { files }: any = req;

    await postSchema.validate(postInfo);
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    if (isTempPost) {
      if (files && files.length) {
        const promises = files.map((file: any) => uploadMediaToCloudinary(file, 'posts'));
        const results = await Promise.all(promises);

        if (results && results.length) media.push(...results);
      }
      postInfo.media = media;
      const typeOfCredit = 'sticky';
      const tempPost = await saveTempPost(postInfo, user, typeOfCredit);
      logger.info(`User: ${user.phone} post: ${tempPost.id}, saved as temp`);
      // logs.push({ post_id: tempPost.id, transaction: undefined, user: user.phone, activity: 'Saved as temp post' });
    } else {
      const { typeOfCredit, credit } = await typeOfCreditToDeduct(
        user.id,
        user.is_agent,
        postInfo.isStickyPost,
        isStickyOnly,
      );
      if (!typeOfCredit) throw new ErrorHandler(402, 'You do not have enough credit');

      if (files && files.length) {
        const promises = files.map((file: any) => uploadMediaToCloudinary(file, 'posts'));
        const results = await Promise.all(promises);

        if (results && results.length) media.push(...results);
      }

      postInfo.media = media;

      const postedDate = new Date();
      const publicDate = new Date();

      const newPost = await savePost(postInfo, user, typeOfCredit, postedDate, publicDate);
      await updateCredit(userId, typeOfCredit, 1, 'SUB', credit);
      logger.info(`User: ${user.phone} created new post: ${newPost.id}`);
      logs.push({ post_id: newPost.id, transaction: undefined, user: user.phone, activity: 'New post created' });

      if (typeOfCredit === 'free' && credit.free === 1) {
        const slackMsg = `User consumed their free credits\n ${
          user?.phone ? `<https://wa.me/965${user?.phone}|${user?.phone}>` : ''
        } - ${user?.admin_comment || ''}`;
        await alertOnSlack('imp', slackMsg);
        await sendSms(user.phone, 'You have consumed all of your free credits');
      }
      if (typeOfCredit === 'agent' && credit.agent === 1) {
        const slackMsg = `Agent credit is now 0\n ${
          user?.phone ? `<https://wa.me/965${user?.phone}|${user?.phone}>` : ''
        } - ${user?.admin_comment || ''}`;
        await alertOnSlack('imp', slackMsg);
        await sendSms(user.phone, 'Your agent credit is now 0');
      }
    }
    if (logs && logs.length) await saveUserLog(logs);
    return res.status(200).json({ success: 'Post created successfully' });
  } catch (error) {
    const user = await findUserByPhone(postInfo.phone);
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    const slackMsg = `Failed to create post\n${
      postInfo?.phone ? `<https://wa.me/965${postInfo?.phone}|${postInfo?.phone}>` : ''
    } - ${user?.admin_comment ? `${user.admin_comment}` : ''}\nError message: "${error.message}"`;
    await alertOnSlack('non-imp', slackMsg);
    logs.push({ post_id: undefined, transaction: undefined, user: `${userId}`, activity: 'Failed to create post' });
    if (logs && logs.length) await saveUserLog(logs);
    return next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { postInfo, postId } = req.body;
  const user = res.locals?.user?.payload;
  const media: string[] = [];
  let post;

  try {
    const { files }: any = req;

    post = await findPostById(postId);
    if (!post) {
      post = await findArchivedPostById(postId);
    }
    if (!post) {
      post = await findDeletedPostById(postId);
    }
    if (!post) throw new ErrorHandler(404, 'Post not found');

    checkAuthorization(user, post.user.id);

    await postSchema.validate(postInfo);
    await removePostMedia(postId);

    if (files && files.length) {
      const promises = files.map((file: any) => uploadMediaToCloudinary(file, 'posts'));
      const results = await Promise.all(promises);

      if (results && results.length) media.push(...results);
    }

    postInfo.media = media;
    let updatedPost;

    switch (post.post_type) {
      case 'active':
        updatedPost = await updatePost(postInfo, post);
        break;
      case 'archived':
        updatedPost = await updateArchivePost(postInfo, post);
        break;
      case 'deleted':
        updatedPost = await updateDeletedPost(postInfo, post);
        break;
      default:
        break;
    }
    logger.info(`User: ${updatedPost?.phone} updated post: ${updatedPost?.id}`);
    await saveUserLog([
      {
        post_id: updatedPost?.id,
        transaction: undefined,
        user: updatedPost?.phone,
        activity: 'Post updated successfully',
      },
    ]);
    return res.status(200).json({ success: 'Post Updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    await saveUserLog([
      { post_id: parseInt(postId, 10), transaction: undefined, user: undefined, activity: 'Post update failed' },
    ]);
    return next(error);
  }
};

const updatePostToStick = async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user.payload.id;
  const userPhone = res.locals.user.payload.phone;
  const { postId } = req.body;

  try {
    const user: any = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');
    if (!postId) throw new ErrorHandler(404, 'Invalid payload passed');

    const credit = await findCreditByUserId(userId);
    if (!credit) throw new ErrorHandler(500, 'Something went wrong');

    if (credit.sticky < 1) throw new ErrorHandler(402, 'You do not have enough credit');

    const post = await findPostById(parseInt(postId, 10));
    if (!post) throw new ErrorHandler(500, 'Something went wrong');
    if (post.is_sticky) throw new ErrorHandler(304, 'Post is already sticky');

    await updatePostStickyVal(post, true);
    const slackMsg = `Post titled ${post.title} is sticked by \n<https://wa.me/965${post?.user.phone}|${
      post?.user.phone
    }> - ${user.admin_comment || ''}`;
    await alertOnSlack('imp', slackMsg);
    logger.info(`Post ${post.id} sticked by user ${user?.phone}`);
    await saveUserLog([
      {
        post_id: post.id,
        transaction: undefined,
        user: user?.phone ?? undefined,
        activity: 'Post sticked successfully',
      },
    ]);

    let creditType = post.credit_type;
    if (creditType === 'agent' && !user?.is_agent) creditType = 'regular';
    const updatedCredit = await updateCredit(user.id, post.credit_type, 1, 'ADD', credit);
    await updateCredit(user.id, 'sticky', 1, 'SUB', updatedCredit);

    return res.status(200).json({ success: 'Post is sticked successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} stick attempt by user ${userPhone} failed`);
    await saveUserLog([
      {
        post_id: parseInt(postId, 10),
        transaction: undefined,
        user: userPhone,
        activity: 'Post stick attempt failed',
      },
    ]);
    return next(error);
  }
};

const rePost = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;
  const { postId } = req.body;

  try {
    if (!user) throw new ErrorHandler(500, 'Something went wrong');
    if (!postId) throw new ErrorHandler(404, 'Invalid payload passed');

    let post;
    post = await findPostById(postId);
    if (!post) post = await findArchivedPostById(postId);
    if (!post) throw new ErrorHandler(500, 'Something went wrong');

    const credit = await findCreditByUserId(user.id);
    if (!credit) throw new ErrorHandler(500, 'Something went wrong');

    let typeOfCredit;

    if (credit.free > 0) typeOfCredit = 'free';
    else if (user.is_agent && credit.agent > 0) typeOfCredit = 'agent';
    else if (credit.regular > 0) typeOfCredit = 'regular';

    if (!typeOfCredit) throw new ErrorHandler(402, 'You do not have enough credit');

    const postInfo = {
      id: post.id,
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
      repost_count: post.repost_count,
      views: 0,
    };

    const postedDate = post.posted_date;
    const publicDate = new Date();

    const newPost = await savePost(postInfo, user as IUser, typeOfCredit, postedDate, publicDate);
    await removeArchivedPost(post.id);
    await updateCredit(user.id, typeOfCredit, 1, 'SUB', credit);
    const repostCount = post.repost_count + 1;
    await updatePostRepostVals(newPost, true, repostCount);
    await updateLocationCountValue(post.city_id, 'increment');
    logger.info(`Post ${post.id} reposted by user ${user?.phone}`);
    await saveUserLog([
      {
        post_id: post.id,
        transaction: undefined,
        user: user?.phone ?? undefined,
        activity: 'Post reposted successfully',
      },
    ]);
    return res.status(200).json({ success: 'Post is reposted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} repost by user ${user.phone} failed`);
    await saveUserLog([
      { post_id: parseInt(postId, 10), transaction: undefined, user: user.phone, activity: 'Post repost failed' },
    ]);
    return next(error);
  }
};

const restore = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;
  const { postId } = req.body;

  try {
    if (!postId) throw new ErrorHandler(404, 'Invalid payload passed');
    const post = await findDeletedPostById(postId);
    if (!post) throw new ErrorHandler(500, 'Something went wrong');

    const userObj = await findUserById(post.user.id);

    if (!userObj) throw new ErrorHandler(500, 'Something went wrong');

    const postInfo = Post.create({
      id: post.id,
      title: post.title,
      city_id: post.city_id,
      city_title: post.city_title,
      state_id: post.state_id,
      state_title: post.state_title,
      property_id: post.property_id,
      property_title: post.property_title,
      category_id: post.category_id,
      category_title: post.category_title,
      price: post.price,
      description: post.description,
      media: post.media,
      sticked_date: post.sticked_date,
      repost_count: post.repost_count,
      views: post.views,
      expiry_date: post.expiry_date,
      posted_date: post.posted_date,
      public_date: post.public_date,
      is_sticky: post.is_sticky,
      sticky_expires: post.sticky_expires,
      post_type: 'active',
      credit_type: post.credit_type,
      user: userObj,
    });

    await Post.save(postInfo);
    await removeDeletedPost(post.id);

    await updateLocationCountValue(post.city_id, 'increment');
    logger.info(`Post ${post.id} restored by user ${user?.phone}`);
    await saveUserLog([
      {
        post_id: post.id,
        transaction: undefined,
        user: user?.phone ?? undefined,
        activity: 'Post restored successfully',
      },
    ]);
    return res.status(200).json({ success: 'Post is restored successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} restore attempt by user ${user.phone} failed`);
    await saveUserLog([
      { post_id: parseInt(postId, 10), transaction: undefined, user: user.phone, activity: 'Post restore failed' },
    ]);
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

    await updateLocationCountValue(post.city_id, 'decrement');

    post.media = [];

    await saveDeletedPost(post, user);
    logger.info(`Post ${postId} deleted by user ${user.phone}`);
    await saveUserLog([
      { post_id: parseInt(postId, 10), transaction: undefined, user: `${user.phone}`, activity: 'Post deleted' },
    ]);
    return res.status(200).json({ success: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Post ${postId} delete attempt by user ${userId} failed`);
    await saveUserLog([
      {
        post_id: parseInt(postId, 10),
        transaction: undefined,
        user: `${userId}`,
        activity: 'Post delete attempt failed',
      },
    ]);
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
  fetchOneForEdit,
  fetchMany,
  updatePostToStick,
  rePost,
  restore,
  deletePost,
  fetchManyArchive,
  increasePostCount,
};
