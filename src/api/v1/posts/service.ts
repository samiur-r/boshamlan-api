import dayJs from 'dayjs';
import path from 'path';
import { LessThan } from 'typeorm';
import { deleteFile } from '../../../utils/deleteFile';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { IUser } from '../users/interfaces';
import { findUserById } from '../users/service';
import { IPost } from './interfaces';
import { ArchivePost } from './models/ArchivePost';
import { DeletedPost } from './models/DeletedPost';
import { Post } from './models/Post';
import { TempPost } from './models/TempPost';

const savePost = async (
  postInfo: {
    title: string;
    cityId: number;
    cityTitle: string;
    stateId: number;
    stateTitle: string;
    propertyId: number;
    propertyTitle: string;
    categoryId: number;
    categoryTitle: string;
    price: number;
    description: string;
    media: string[];
  },
  user: IUser,
  typeOfCredit: string,
) => {
  const newPost = Post.create({
    title: postInfo.title,
    city_id: postInfo.cityId,
    city_title: postInfo.cityTitle,
    state_id: postInfo.stateId,
    state_title: postInfo.stateTitle,
    property_id: postInfo.propertyId,
    property_title: postInfo.propertyTitle,
    category_id: postInfo.categoryId,
    category_title: postInfo.categoryTitle,
    price: postInfo.price,
    description: postInfo.description,
    expiry_date: dayJs().month(2),
    media: postInfo.media,
    is_sticky: typeOfCredit === 'sticky',
    credit_type: typeOfCredit,
    user,
  });

  const post = await Post.save(newPost);
  return post;
};

const saveArchivedPost = async (postInfo: IPost, user: IUser) => {
  const newPost = ArchivePost.create({
    title: postInfo.title,
    city_id: postInfo.city_id,
    city_title: postInfo.city_title,
    state_id: postInfo.state_id,
    state_title: postInfo.state_title,
    property_id: postInfo.property_id,
    property_title: postInfo.property_title,
    category_id: postInfo.category_id,
    category_title: postInfo.category_title,
    price: postInfo.price,
    description: postInfo.description,
    expiry_date: postInfo.expiry_date,
    is_reposted: postInfo.is_reposted,
    repost_count: postInfo.repost_count,
    media: postInfo.media,
    is_sticky: false,
    credit_type: postInfo.credit_type,
    user,
  });

  await ArchivePost.save(newPost);
};

const saveDeletedPost = async (postInfo: IPost, user: IUser) => {
  const newPost = DeletedPost.create({
    title: postInfo.title,
    city_id: postInfo.city_id,
    city_title: postInfo.city_title,
    state_id: postInfo.state_id,
    state_title: postInfo.state_title,
    property_id: postInfo.property_id,
    property_title: postInfo.property_title,
    category_id: postInfo.category_id,
    category_title: postInfo.category_title,
    price: postInfo.price,
    description: postInfo.description,
    expiry_date: dayJs().month(2),
    media: postInfo.media,
    is_sticky: false,
    credit_type: postInfo.credit_type,
    is_reposted: postInfo.is_reposted,
    repost_count: postInfo.repost_count,
    user,
  });

  await DeletedPost.save(newPost);
};

const saveTempPost = async (
  postInfo: {
    trackId: string;
    title: string;
    cityId: number;
    cityTitle: string;
    stateId: number;
    stateTitle: string;
    propertyId: number;
    propertyTitle: string;
    categoryId: number;
    categoryTitle: string;
    price: number;
    description: string;
    media: string[];
  },
  user: IUser,
  typeOfCredit: string,
) => {
  const newPost = TempPost.create({
    track_id: postInfo.trackId,
    title: postInfo.title,
    city_id: postInfo.cityId,
    city_title: postInfo.cityTitle,
    state_id: postInfo.stateId,
    state_title: postInfo.stateTitle,
    property_id: postInfo.propertyId,
    property_title: postInfo.propertyTitle,
    category_id: postInfo.categoryId,
    category_title: postInfo.categoryTitle,
    price: postInfo.price,
    description: postInfo.description,
    expiry_date: dayJs().month(2),
    media: postInfo.media,
    is_sticky: typeOfCredit === 'sticky',
    credit_type: typeOfCredit,
    user,
  });

  await TempPost.save(newPost);
};

const removePost = async (id: number) => {
  await Post.delete(id);
};

const removeArchivedPost = async (id: number) => {
  await ArchivePost.delete(id);
};

const removePostMedia = async (id: number) => {
  const result = await Post.find({ where: { id }, select: { media: true, city_id: true }, relations: [] });

  if (result.length && result[0].media && result[0].media.length) {
    const currentDirectory = __dirname;
    const filePath = path.resolve(currentDirectory, '../../../../../boshamlan-frontend/public/images/posts');
    result[0].media.forEach((file) => {
      deleteFile(`${filePath}/${file}`);
    });
  }
};

const moveExpiredPosts = async () => {
  const expiredPosts = await Post.find({ where: { expiry_date: LessThan(new Date()) } });

  expiredPosts.forEach(async (post) => {
    await removePost(post.id);
    await saveArchivedPost(post, post.user);
  });

  return expiredPosts;
};

const removeTempPost = async (id: number) => {
  await TempPost.delete(id);
};

const removeTempPostByTrackId = async (track_id: string) => {
  try {
    const post = await TempPost.findOneBy({ track_id });

    if (!post) throw new ErrorHandler(500, 'Something went wrong');

    if (post.media.length > 0) {
      const currentDirectory = __dirname;
      const filePath = path.resolve(currentDirectory, '../../../../../boshamlan-frontend/public/images/posts');
      post.media.forEach((file) => deleteFile(`${filePath}/${file}`));
    }
    await TempPost.remove(post);
  } catch (error) {
    logger.error(`${error.name} ${error.message}`);
  }
};

const moveTempPost = async (track_id: string) => {
  const post: any = await TempPost.findOne({ where: { track_id } });

  if (!post) throw new ErrorHandler(500, 'Something went wrong');

  const user = await findUserById(post?.user.id);

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

  await savePost(postInfo, user as IUser, 'sticky');
  await removeTempPost(post.id);
};

const findPostByUserId = async (userId: number) => {
  const posts: IPost[] | null = await Post.find({ where: { user: { id: userId } } });

  // eslint-disable-next-line no-param-reassign
  posts.forEach((post) => delete post.user);

  return posts;
};

const findArchivedPostByUserId = async (limit: number, offset: number | undefined, userId: number | undefined) => {
  const archivePosts: IPost[] | null = await ArchivePost.find({
    where: { user: { id: userId } },
    take: limit,
    skip: offset,
  });

  let archiveCount;

  if (offset === 0) archiveCount = await ArchivePost.count({ where: { user: { id: userId } } });

  // eslint-disable-next-line no-param-reassign
  archivePosts.forEach((post) => delete post.user);

  return { archivePosts, archiveCount };
};

const findPostById = async (id: number) => {
  const post: IPost | null = await Post.findOneBy({ id });
  return post;
};

const findArchivedPostById = async (id: number) => {
  const post: IPost | null = await ArchivePost.findOneBy({ id });

  delete post?.user;

  return post;
};

const updatePost = async (
  postInfo: {
    cityId: number;
    cityTitle: string;
    stateId: number;
    stateTitle: string;
    propertyId: number;
    propertyTitle: string;
    categoryId: number;
    categoryTitle: string;
    price: number;
    description: string;
    media: string[];
  },
  postId: number,
) => {
  const post = await findPostById(postId);

  if (!post) throw new ErrorHandler(500, 'Something went wrong');

  const newPost = await Post.save({
    ...post,
    city_id: postInfo.cityId,
    city_title: postInfo.cityTitle,
    state_id: postInfo.stateId,
    state_title: postInfo.stateTitle,
    property_id: postInfo.propertyId,
    property_title: postInfo.propertyTitle,
    category_id: postInfo.categoryId,
    category_title: postInfo.categoryTitle,
    price: postInfo.price,
    description: postInfo.description,
    media: postInfo.media,
  });

  return newPost;
};

const updatePostStickyVal = async (post: IPost, isSticky: boolean) => {
  const newPost = Post.create({
    ...post,
    is_sticky: isSticky,
  });
  await Post.save(newPost);
};

const updatePostRepostVals = async (post: IPost, isReposted: boolean, repostCount: number) => {
  const newPost = Post.create({
    ...post,
    is_reposted: isReposted,
    repost_count: repostCount,
  });
  await Post.save(newPost);
};

const findPosts = async (limit: number, offset: number | undefined, userId: number | undefined) => {
  const queryOptions: any = {
    order: {
      is_sticky: 'DESC',
      created_at: 'DESC',
    },
    take: limit,
    skip: offset,
  };

  if (userId) {
    queryOptions.where = { user: { id: userId } };
  }

  const posts: IPost[] | null = await Post.find(queryOptions);

  let count;

  if (offset === 0) count = await Post.count({ where: { user: { id: userId } } });

  // eslint-disable-next-line no-param-reassign
  posts.forEach((post) => delete post.user);

  return { posts, count };
};

export {
  savePost,
  moveExpiredPosts,
  saveArchivedPost,
  saveDeletedPost,
  saveTempPost,
  moveTempPost,
  removeTempPostByTrackId,
  findPostByUserId,
  findArchivedPostById,
  findArchivedPostByUserId,
  findPostById,
  findPosts,
  removePostMedia,
  removeArchivedPost,
  removePost,
  updatePost,
  updatePostStickyVal,
  updatePostRepostVals,
};
