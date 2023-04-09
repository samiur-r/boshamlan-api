/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Between, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual } from 'typeorm';
import cloudinary from '../../../config/cloudinary';
import { deleteMediaFromCloudinary } from '../../../utils/cloudinaryUtils';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { updateLocationCountValue } from '../locations/service';
import { IUser } from '../users/interfaces';
import { findUserById } from '../users/service';
import { IPost } from './interfaces';
import { ArchivePost } from './models/ArchivePost';
import { DeletedPost } from './models/DeletedPost';
import { Post } from './models/Post';
import { TempPost } from './models/TempPost';

interface PostsWithUser extends IPost {
  user_phone?: string;
  posted_date?: string;
  public_date?: string;
  expired_date?: string;
}

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
  const today = new Date();
  const oneMonthFromToday = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

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
    expiry_date: oneMonthFromToday,
    media: postInfo.media,
    is_sticky: typeOfCredit === 'sticky',
    credit_type: typeOfCredit,
    user,
  });

  const post = await Post.save(newPost);
  await updateLocationCountValue(postInfo.cityId, 'increment');
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
    expiry_date: postInfo.expiry_date,
    media: postInfo.media,
    is_sticky: false,
    credit_type: postInfo.credit_type,
    is_reposted: postInfo.is_reposted,
    repost_count: postInfo.repost_count,
    user,
  });
  await updateLocationCountValue(postInfo.city_id, 'decrement');
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
  const today = new Date();
  const oneMonthFromToday = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

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
    expiry_date: oneMonthFromToday,
    media: postInfo.media,
    is_sticky: typeOfCredit === 'sticky',
    credit_type: typeOfCredit,
    user,
  });

  const newTempPost = await TempPost.save(newPost);
  return newTempPost;
};

const removePostMedia = async (id?: number, post?: IPost) => {
  let result;
  if (!post) {
    const postObj = await Post.find({ where: { id }, select: { media: true }, relations: [] });
    // eslint-disable-next-line prefer-destructuring
    result = postObj && postObj.length ? postObj[0].media : undefined;
  } else result = post?.media;

  if (result && result.length) {
    for (const multimedia of result) {
      await deleteMediaFromCloudinary(multimedia, 'posts');
    }
  }
};

const removePost = async (id: number, post?: IPost) => {
  await Post.delete(id);
  await removePostMedia(id, post);
};

const removeArchivedPost = async (id: number, post?: IPost) => {
  await ArchivePost.delete(id);
  await removePostMedia(id, post);
};

const moveExpiredPosts = async () => {
  const expiredPosts = await Post.find({ where: { expiry_date: LessThan(new Date()) } });

  expiredPosts.forEach(async (post) => {
    await removePost(post.id, post);
    await saveArchivedPost(post, post.user);
    await updateLocationCountValue(post.city_id, 'decrement');
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

    if (post.media && post.media.length) {
      for (const multimedia of post.media) {
        await deleteMediaFromCloudinary(multimedia, 'posts');
      }
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
  const post: any = await Post.findOneBy({ id });

  if (post) {
    post.phone = post?.user?.phone;
    delete post?.user?.password;
  }
  return post;
};

const findArchivedPostById = async (id: number) => {
  const post: any = await ArchivePost.findOneBy({ id });

  if (post) {
    post.phone = post?.user?.phone;
    delete post?.user?.password;
  }

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

  if (!post) throw new ErrorHandler(401, 'Post not found');

  await Post.save({
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

  await updateLocationCountValue(postInfo.cityId, 'increment');

  return post;
};

const updatePostStickyVal = async (post: IPost, isSticky: boolean) => {
  const today = new Date();
  const oneMonthFromToday = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );
  const newPost = Post.create({
    ...post,
    expiry_date: oneMonthFromToday,
    is_sticky: isSticky,
  });
  await Post.save(newPost);
};

const updatePostViewCount = async (id: number, count: number) => {
  const post = await Post.findOneBy({ id });
  if (!post) throw new ErrorHandler(404, 'Post not found');

  const viewCount = post.views + count;

  await Post.save({
    ...post,
    views: viewCount,
  });
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

  if (offset === 0 && userId) count = await Post.count({ where: { user: { id: userId } } });
  else if (offset === 0 && !userId) count = await Post.count();

  // eslint-disable-next-line no-param-reassign
  posts.forEach((post) => delete post.user);

  return { posts, count };
};

const searchPosts = async (
  limit: number,
  offset: number | undefined,
  city?: Array<{ id: number; title: string; state_id: number | null }>,
  stateId?: number,
  propertyId?: number,
  categoryId?: number,
  priceRange?: { min: number; max: number },
  keyword?: string,
) => {
  const searchCriteria: any = {};

  if (categoryId) {
    searchCriteria.category_id = categoryId;
  }
  if (propertyId) {
    searchCriteria.property_id = propertyId;
  }
  if (city?.length) {
    searchCriteria.city_id = In(city.map((l) => l.id));
  }
  if (stateId) {
    searchCriteria.state_id = stateId;
  }
  if (priceRange) {
    searchCriteria.price = IsNull() || Between(priceRange.min, priceRange.max);
  }

  if (keyword) {
    searchCriteria.city_title = Like(`%${keyword}%`);
    searchCriteria.state_title = Like(`%${keyword}%`);
    searchCriteria.category_title = Like(`%${keyword}%`);
    searchCriteria.property_title = Like(`%${keyword}%`);
  }

  const [posts, count] = await Post.findAndCount({
    where: searchCriteria,
    order: {
      is_sticky: 'DESC',
      created_at: 'DESC',
    },
    take: limit,
    skip: offset,
  });

  let postIds: number[] = [];

  posts.forEach((post) => {
    postIds = [...postIds, post.id];
  });

  if (postIds.length) await Post.update({ id: In(postIds) }, { views: () => 'views + .5' });

  return { posts, count };
};

const filterPostsForAdmin = async (
  locationToFilter: number,
  categoryToFilter: number,
  propertyTypeToFilter: number,
  fromPriceToFilter: number | undefined,
  toPriceToFilter: number | undefined,
  fromCreationDateToFilter: Date | undefined,
  toCreationDateToFilter: Date | undefined,
  stickyStatusToFilter: number,
  userTypeToFilter: string | undefined,
  orderByToFilter: string,
  postStatusToFilter: string,
  userId: string | undefined,
  offset: number,
) => {
  let posts;
  let totalPosts;
  const where: any = {};
  const order: any = {};

  if (userId) {
    where.user = { id: parseInt(userId, 10) };
  }

  if (locationToFilter) where.city_id = locationToFilter;
  if (categoryToFilter) where.category_id = categoryToFilter;
  if (propertyTypeToFilter) where.property_id = propertyTypeToFilter;

  if (fromPriceToFilter && toPriceToFilter) where.price = Between(fromPriceToFilter, toPriceToFilter);
  else if (fromPriceToFilter) where.price = MoreThanOrEqual(fromPriceToFilter);
  else if (toPriceToFilter) where.price = LessThanOrEqual(toPriceToFilter);

  if (fromCreationDateToFilter && toCreationDateToFilter)
    where.created_at = Between(fromCreationDateToFilter, toCreationDateToFilter);
  else if (fromCreationDateToFilter) where.created_at = MoreThanOrEqual(fromCreationDateToFilter);
  else if (toCreationDateToFilter) where.created_at = LessThanOrEqual(toCreationDateToFilter);

  if (stickyStatusToFilter === -1) where.is_sticky = false;
  else if (stickyStatusToFilter === 1) where.is_sticky = true;

  switch (orderByToFilter) {
    case 'Created':
      order.created_at = 'DESC';
      break;
    case 'Sticked':
      order.is_sticky = 'DESC';
      break;
    case 'Repost Date':
      order.updated_at = 'DESC';
      break;
    case 'City':
      order.city_id = 'DESC';
      break;
    case 'Property Type':
      order.property_id = 'DESC';
      break;
    case 'Category':
      order.category_id = 'DESC';
      break;
    default:
      order.updated_at = 'DESC';
      break;
  }

  try {
    if (postStatusToFilter === 'Active') {
      const [postList, count]: [PostsWithUser[] | null, number] = await Post.findAndCount({
        where,
        order,
        skip: offset,
        take: 10,
      });
      posts = postList;
      totalPosts = count;
    } else if (postStatusToFilter === 'Archived') {
      const [postList, count]: [PostsWithUser[] | null, number] = await ArchivePost.findAndCount({
        where,
        order,
        skip: offset,
        take: 10,
      });
      posts = postList;
      totalPosts = count;
    } else if (postStatusToFilter === 'Deleted') {
      const [postList, count]: [PostsWithUser[] | null, number] = await DeletedPost.findAndCount({
        where,
        order,
        skip: offset,
        take: 10,
      });
      posts = postList;
      totalPosts = count;
    } else if (postStatusToFilter === 'Reposted') {
      where.repost_count = MoreThan(0);
      const [postList, count]: [PostsWithUser[] | null, number] = await Post.findAndCount({
        where,
        order,
        skip: offset,
        take: 10,
      });
      posts = postList;
      totalPosts = count;
    }

    if (userTypeToFilter && userTypeToFilter === 'regular')
      posts = posts?.filter((post) => post.user?.is_agent === false);
    else if (userTypeToFilter && userTypeToFilter === 'agent')
      posts = posts?.filter((post) => post.user?.is_agent === true);

    posts?.forEach((post) => {
      post.posted_date = post.updated_at.toISOString().slice(0, 10);
      post.public_date = post.created_at.toISOString().slice(0, 10);
      post.expired_date = post.expiry_date.toISOString().slice(0, 10);
      post.user_phone = post.user?.phone;
      delete post.user;
    });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
  }
  const totalPages = totalPosts ? Math.ceil(totalPosts / 10) : null;
  return { posts, totalPages };
};

const removeAllPostsOfUser = async (userId: number) => {
  const activePosts = await findPostByUserId(userId);
  const archivedPosts = await ArchivePost.find({ where: { user: { id: userId } } });
  const user = await findUserById(userId);

  if (!user) throw new ErrorHandler(500, 'Something went wrong');

  const allPosts = [...activePosts, ...archivedPosts];
  const mediaUrls = allPosts.reduce((acc, post) => [...acc, ...post.media] as any, []);

  const promises = allPosts.map(async (post) => {
    post.media = [];
    await saveDeletedPost(post, user);
  });

  await Promise.allSettled(
    mediaUrls.map(async (url: string) => {
      const publicId = url.split('/').pop()?.split('.')[0];

      if (publicId) await cloudinary.uploader.destroy(`posts/${publicId}`);
    }),
  );

  await Promise.all(promises);
  await Post.remove(activePosts as any);
  await ArchivePost.remove(archivedPosts as any);
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
  updatePostViewCount,
  searchPosts,
  filterPostsForAdmin,
  removeAllPostsOfUser,
};
