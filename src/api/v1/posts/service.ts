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
    user,
  });

  await Post.save(newPost);
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
    expiry_date: dayJs().month(2),
    media: postInfo.media,
    is_sticky: false,
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
    user,
  });

  await TempPost.save(newPost);
};

const removePost = async (id: number) => {
  await Post.delete(id);
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

const findArchivedPostByUserId = async (userId: number) => {
  const posts: IPost[] | null = await ArchivePost.find({ where: { user: { id: userId } } });

  // eslint-disable-next-line no-param-reassign
  posts.forEach((post) => delete post.user);

  return posts;
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
  findArchivedPostByUserId,
};
