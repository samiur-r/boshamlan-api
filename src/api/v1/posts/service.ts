/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Between, In, IsNull, LessThan, LessThanOrEqual, Like } from 'typeorm';
import cloudinary from '../../../config/cloudinary';
import AppDataSource from '../../../db';
import { deleteMediaFromCloudinary } from '../../../utils/cloudinaryUtils';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { parseTimestamp } from '../../../utils/timestampUtls';
import { findAgentByUserId } from '../agents/service';
import { updateLocationCountValue } from '../locations/service';
import { IUser } from '../users/interfaces';
import { User } from '../users/model';
import { findUserById } from '../users/service';
import { saveUserLog } from '../user_logs/service';
import { IPost } from './interfaces';
import { ArchivePost } from './models/ArchivePost';
import { DeletedPost } from './models/DeletedPost';
import { Post } from './models/Post';
import { TempPost } from './models/TempPost';

const generatePostId = async () => {
  const [maxPostId, maxArchivePostId, maxDeletedPostId] = await Promise.all([
    Post.createQueryBuilder('post').select('MAX(post.id)', 'maxId').getRawOne(),
    ArchivePost.createQueryBuilder('archive_post').select('MAX(archive_post.id)', 'maxId').getRawOne(),
    DeletedPost.createQueryBuilder('deleted_post').select('MAX(deleted_post.id)', 'maxId').getRawOne(),
  ]);

  const maxId = Math.max(maxPostId.maxId, maxArchivePostId.maxId, maxDeletedPostId.maxId) + 1;
  return maxId;
};

const savePost = async (
  postInfo: {
    id?: number;
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
    views?: number;
    repost_count?: number;
  },
  user: IUser,
  typeOfCredit: string,
  postedDate: Date,
  publicDate: Date,
) => {
  const today = new Date();
  // const oneMonthFromToday = new Date(
  //   today.getFullYear(),
  //   today.getMonth() + 1,
  //   today.getDate(),
  //   today.getHours(),
  //   today.getMinutes(),
  //   today.getSeconds(),
  // );

  // oneMonthFromToday.setMinutes(Math.ceil(oneMonthFromToday.getMinutes() / 30) * 30);
  // oneMonthFromToday.setSeconds(0);
  // oneMonthFromToday.setMilliseconds(0);

  const twoDaysFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 2,
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

  twoDaysFromToday.setMinutes(Math.ceil(twoDaysFromToday.getMinutes() / 30) * 30);
  twoDaysFromToday.setSeconds(0);
  twoDaysFromToday.setMilliseconds(0);

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
    expiry_date: twoDaysFromToday,
    posted_date: postedDate,
    public_date: publicDate,
    sticked_date: typeOfCredit === 'sticky' ? today : undefined,
    media: postInfo.media,
    is_sticky: typeOfCredit === 'sticky',
    credit_type: typeOfCredit,
    views: postInfo.views ?? 0,
    repost_count: postInfo.repost_count ?? 0,
    post_type: 'active',
    created_at: today,
    user,
  });

  if (postInfo.id !== undefined) {
    newPost.id = postInfo.id;
  } else {
    newPost.id = await generatePostId();
  }

  const post = await Post.save(newPost);
  await updateLocationCountValue(postInfo.cityId, 'increment');
  return post;
};

const saveArchivedPost = async (postInfo: IPost, user: IUser) => {
  if (!postInfo.id) throw new ErrorHandler(401, 'Post id is required');
  const newPost = ArchivePost.create({
    id: postInfo.id,
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
    posted_date: postInfo.posted_date,
    public_date: postInfo.public_date,
    sticked_date: postInfo.sticked_date,
    repost_date: postInfo.repost_date,
    repost_count: postInfo.repost_count,
    media: postInfo.media,
    credit_type: postInfo.credit_type,
    views: postInfo.views,
    updated_at: postInfo.updated_at,
    post_type: 'archived',
    user,
  });

  await ArchivePost.save(newPost);
};

const saveDeletedPost = async (postInfo: IPost, user: IUser) => {
  if (!postInfo.id) throw new ErrorHandler(401, 'Post id is required');
  const today = new Date();
  const newPost = DeletedPost.create({
    id: postInfo.id,
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
    posted_date: postInfo.posted_date,
    public_date: postInfo.public_date,
    sticked_date: postInfo.sticked_date,
    repost_date: postInfo.repost_date,
    media: postInfo.media,
    credit_type: postInfo.credit_type,
    repost_count: postInfo.repost_count,
    views: postInfo.views,
    deleted_at: today,
    updated_at: postInfo.updated_at,
    post_type: 'deleted',
    is_sticky: postInfo.is_sticky,
    sticky_expires: postInfo.sticky_expires,
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
  const today = new Date();
  // const oneMonthFromToday = new Date(
  //   today.getFullYear(),
  //   today.getMonth() + 1,
  //   today.getDate(),
  //   today.getHours(),
  //   today.getMinutes(),
  //   today.getSeconds(),
  // );

  const twoDaysFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 2,
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
    expiry_date: twoDaysFromToday,
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
    result = postObj && postObj.length ? postObj[0].media : [];
  } else result = post?.media;

  const promises = result.map((multimedia) => deleteMediaFromCloudinary(multimedia, 'posts'));
  return Promise.all(promises);
};

const removeDeletedPost = async (id: number) => {
  await DeletedPost.delete(id);
};

const removePost = async (id: number, post?: IPost) => {
  await Post.delete(id);
  await removePostMedia(id, post);
};

const removePostRow = async (id: number) => {
  await Post.delete(id);
};

const removeArchivedPost = async (id: number, post?: IPost) => {
  await ArchivePost.delete(id);
  await removePostMedia(id, post);
};

const unstickPost = async () => {
  const affectedPosts = await Post.find({
    where: { is_sticky: true, sticky_expires: LessThan(new Date()) },
  });

  const updatedPosts = affectedPosts.map((post) => {
    post.is_sticky = false;
    // @ts-ignore
    post.sticky_expires = null;
    return post;
  });

  await Post.save(updatedPosts);

  if (affectedPosts && affectedPosts.length) {
    for (const post of affectedPosts) {
      logger.info(`Post ${post.id} un sticked`);
      await saveUserLog([
        {
          post_id: post.id,
          transaction: undefined,
          user: post.user.phone,
          activity: `Post ${post.id} un sticked`,
        },
      ]);
    }
  }
};

const moveExpiredPosts = async () => {
  const expiredPosts = await Post.find({ where: { expiry_date: LessThan(new Date()) } });

  expiredPosts.forEach(async (post) => {
    await removePostRow(post.id);
    await saveArchivedPost(post, post.user);
    await updateLocationCountValue(post.city_id, 'decrement');
    logger.info(`Post ${post.id} by user ${post.user.phone} has archived`);
    await saveUserLog([
      {
        post_id: post.id,
        transaction: undefined,
        user: post.user.phone,
        activity: `Post ${post.id} by user ${post.user.phone} has archived`,
      },
    ]);
  });

  return expiredPosts;
};

const removeArchivedPostsMedia = async () => {
  const currentDate = new Date();
  const threeMonthsAgo = new Date();
  // threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
  threeMonthsAgo.setDate(currentDate.getDate() - 3);

  const posts = await ArchivePost.find({ where: { expiry_date: LessThanOrEqual(threeMonthsAgo) } });

  posts.forEach(async (post) => {
    await removePostMedia(post.id, post);
    await ArchivePost.save({
      ...post,
      media: [],
    });
    logger.info(`The media assets of archived Post ${post.id} by user ${post.user.phone} has been deleted`);
    await saveUserLog([
      {
        post_id: post.id,
        transaction: undefined,
        user: post.user.phone,
        activity: `The media assets of archived Post ${post.id} by user ${post.user.phone} has been deleted`,
      },
    ]);
  });
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

  const postedDate = new Date();
  const publicDate = new Date();

  const newPost = await savePost(postInfo, user as IUser, 'sticky', postedDate, publicDate);
  await removeTempPost(post.id);
  return newPost;
};

const findPostByUserId = async (userId: number) => {
  const posts: IPost[] | null = await Post.find({ where: { user: { id: userId } } });

  // eslint-disable-next-line no-param-reassign
  posts.forEach((post) => delete post.user);

  return posts;
};

const findPostCountByUserId = async (userId: number) => {
  const count = await Post.count({ where: { user: { id: userId } } });

  return count;
};

const findArchivedPostByUserId = async (limit: number, offset: number | undefined, userId: number | undefined) => {
  const archivePosts: IPost[] | null = await ArchivePost.find({
    where: { user: { id: userId } },
    order: { public_date: 'DESC' },
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

const findDeletedPostById = async (id: number) => {
  const post: any = await DeletedPost.findOneBy({ id });

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
  post: IPost,
) => {
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

  if (post.city_id !== postInfo.cityId) {
    await updateLocationCountValue(postInfo.cityId, 'increment');
    await updateLocationCountValue(post.city_id, 'decrement');
  }

  return post;
};

const updateArchivePost = async (
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
  post: IPost,
) => {
  await ArchivePost.save({
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

  return post;
};

const updateDeletedPost = async (
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
  post: IPost,
) => {
  await DeletedPost.save({
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

  return post;
};

const updatePostStickyVal = async (post: IPost, isSticky: boolean) => {
  const today = new Date();
  // const oneMonthFromToday = new Date(
  //   today.getFullYear(),
  //   today.getMonth() + 1,
  //   today.getDate(),
  //   today.getHours(),
  //   today.getMinutes(),
  //   today.getSeconds(),
  // );

  // const oneWeekFromToday = new Date(
  //   today.getFullYear(),
  //   today.getMonth(),
  //   today.getDate() + 7,
  //   today.getHours(),
  //   today.getMinutes(),
  //   today.getSeconds(),
  // );

  // const twentyThreeDaysFromToday = new Date(
  //   today.getFullYear(),
  //   today.getMonth(),
  //   today.getDate() + 23,
  //   today.getHours(),
  //   today.getMinutes(),
  //   today.getSeconds(),
  // );

  const twoDaysFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 2,
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

  twoDaysFromToday.setMinutes(Math.ceil(twoDaysFromToday.getMinutes() / 30) * 30);
  twoDaysFromToday.setSeconds(0);
  twoDaysFromToday.setMilliseconds(0);

  const oneDayFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

  oneDayFromToday.setMinutes(Math.ceil(oneDayFromToday.getMinutes() / 30) * 30);
  oneDayFromToday.setSeconds(0);
  oneDayFromToday.setMilliseconds(0);

  const newPost = Post.create({
    ...post,
    views: 0,
    sticked_date: isSticky ? today : undefined,
    sticky_expires: isSticky ? oneDayFromToday : undefined,
    expiry_date: isSticky ? twoDaysFromToday : oneDayFromToday,
    is_sticky: isSticky,
    public_date: isSticky ? today : post.public_date,
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
  const today = new Date();

  const newPost = Post.create({
    ...post,
    is_reposted: isReposted,
    repost_count: repostCount,
    repost_date: isReposted ? today : undefined,
  });
  await Post.save(newPost);
};

const findPosts = async (limit: number, offset: number | undefined, userId: number | undefined) => {
  const queryOptions: any = {
    order: {
      is_sticky: 'DESC',
      public_date: 'DESC',
    },
    take: limit,
    skip: offset,
  };

  if (userId) {
    queryOptions.where = { user: { id: userId } };
  }

  const posts: any = await Post.find(queryOptions);

  let count;

  if (offset === 0 && userId) count = await Post.count({ where: { user: { id: userId } } });
  else if (offset === 0 && !userId) count = await Post.count();

  for (const post of posts) {
    if (post.user?.is_agent) {
      const agent = await findAgentByUserId(post.user.id);
      if (agent && agent.logo_url) post.agent_logo = agent.logo_url;
    }
    delete post.user?.password;
  }

  return { posts, count };
};

const getColumnToFilterByKeyword = async (keyword: string) => {
  const cityCount = await Post.count({
    where: { city_title: Like(`%${keyword}%`) },
  });

  if (cityCount) return 'city_title';

  const stateCount = await Post.count({
    where: { state_title: Like(`%${keyword}%`) },
  });

  if (stateCount) return 'state_title';

  const propertyCount = await Post.count({
    where: { property_title: Like(`%${keyword}%`) },
  });

  if (propertyCount) return 'property_title';

  const categoryCount = await Post.count({
    where: { category_title: Like(`%${keyword}%`) },
  });

  if (categoryCount) return 'category_title';

  const descriptionCount = await Post.count({
    where: { description: Like(`%${keyword}%`) },
  });

  if (descriptionCount) return 'description';

  return null;
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

  if (city?.length) searchCriteria.city_id = In(city.map((l) => l.id));
  if (stateId) searchCriteria.state_id = stateId;
  if (categoryId) searchCriteria.category_id = categoryId;
  if (propertyId) searchCriteria.property_id = propertyId;
  if (priceRange) {
    if (priceRange.min === 0) searchCriteria.price = IsNull() || Between(priceRange.min, priceRange.max);
    else searchCriteria.price = Between(priceRange.min, priceRange.max);
  }

  if (keyword) {
    const column = await getColumnToFilterByKeyword(keyword);
    // eslint-disable-next-line security/detect-object-injection
    if (column) searchCriteria[column] = Like(`%${keyword}%`);
  }

  const [posts, count]: any = await Post.findAndCount({
    where: searchCriteria,
    order: {
      is_sticky: 'DESC',
      public_date: 'DESC',
    },
    take: limit,
    skip: offset,
  });

  let postIds: number[] = [];

  for (const post of posts) {
    if (post.user?.is_agent) {
      const agent = await findAgentByUserId(post.user.id);
      if (agent && agent.logo_url) post.agent_logo = agent.logo_url;
    }
    postIds = [...postIds, post.id];
    delete post.user?.password;
  }

  // let postIds: number[] = [];

  // posts.forEach((post: any) => {
  //   postIds = [...postIds, post.id];
  // });

  if (postIds.length) await Post.update({ id: In(postIds) }, { views: () => 'views + .5' });

  return { posts, count };
};

const searchPostCount = async (
  city?: Array<{ id: number; title: string; state_id: number | null }>,
  stateId?: number,
  propertyId?: number,
  categoryId?: number,
) => {
  const searchCriteria: any = {};

  if (city?.length) searchCriteria.city_id = In(city.map((l) => l.id));
  if (stateId) searchCriteria.state_id = stateId;
  if (categoryId) searchCriteria.category_id = categoryId;
  if (propertyId) searchCriteria.property_id = propertyId;

  const count: any = await Post.count({
    where: searchCriteria,
  });

  return count;
};

const searchArchivedPosts = async (
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

  const [posts, count] = await ArchivePost.findAndCount({
    where: searchCriteria,
    order: {
      is_sticky: 'DESC',
      public_date: 'DESC',
    },
    take: limit,
    skip: offset,
  });

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
  fromPublicDateToFilter: Date | undefined,
  toPublicDateToFilter: Date | undefined,
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
    where.user_id = parseInt(userId, 10);
  }

  if (locationToFilter) where.city_id = locationToFilter;
  if (categoryToFilter) where.category_id = categoryToFilter;
  if (propertyTypeToFilter) where.property_id = propertyTypeToFilter;

  if (fromPriceToFilter && toPriceToFilter) {
    where.price = {
      '>=': fromPriceToFilter,
      '<=': toPriceToFilter,
    };
  } else if (fromPriceToFilter) {
    where.price = {
      '>=': fromPriceToFilter,
    };
  } else if (toPriceToFilter) {
    where.price = {
      '<=': toPriceToFilter,
    };
  }

  if (fromCreationDateToFilter && toCreationDateToFilter) {
    where.posted_date = {
      '>=': `${fromCreationDateToFilter} 00:00:00`,
      '<=': `${toCreationDateToFilter} 23:59:59`,
    };
  } else if (fromCreationDateToFilter) {
    where.posted_date = {
      '>=': `${fromCreationDateToFilter} 00:00:00`,
    };
  } else if (toCreationDateToFilter) {
    where.posted_date = {
      '<=': `${toCreationDateToFilter} 23:59:59`,
    };
  }

  if (fromPublicDateToFilter && toPublicDateToFilter) {
    where.public_date = {
      '>=': `${fromPublicDateToFilter} 00:00:00`,
      '<=': `${toPublicDateToFilter} 23:59:59`,
    };
  } else if (fromPublicDateToFilter) {
    where.public_date = {
      '>=': `${fromPublicDateToFilter} 00:00:00`,
    };
  } else if (toPublicDateToFilter) {
    where.public_date = {
      '<=': `${toPublicDateToFilter} 23:59:59`,
    };
  }

  if (stickyStatusToFilter === -1) where.is_sticky = false;
  else if (stickyStatusToFilter === 1) where.is_sticky = true;

  if (userTypeToFilter && userTypeToFilter === 'regular') where.user_is_agent = false;
  else if (userTypeToFilter && userTypeToFilter === 'agent') where.user_is_agent = true;

  if (postStatusToFilter) {
    switch (postStatusToFilter) {
      case 'Active':
        where.post_type = 'active';
        break;
      case 'Archived':
        where.post_type = 'archived';
        break;
      case 'Deleted':
        where.post_type = 'deleted';
        break;
      case 'Reposted':
        where.is_reposted = true;
        break;
      default:
        break;
    }
  }

  switch (orderByToFilter) {
    case 'Created':
      order.posted_date = 'DESC';
      break;
    case 'Public Date':
      order.public_date = 'DESC';
      break;
    case 'Sticked':
      order.is_sticky = 'DESC';
      break;
    case 'Repost Date':
      order.repost_date = 'DESC';
      break;
    case 'Repost Count':
      order.repost_count = 'DESC';
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
      order.public_date = 'DESC';
      break;
  }

  try {
    const whereClause = Object.entries(where)
      .map(([key, value]: [string, any]) => {
        if (key === 'is_agent') {
          return `users.${key} = ${value}`;
        }
        if (key === 'posted_date') {
          const from = value['>='];
          const to = value['<='];
          if (from && to) {
            return `latest_posts.posted_date >= '${from}' AND latest_posts.posted_date <= '${to}'`;
          }
          if (from) {
            return `latest_posts.posted_date >= '${from}'`;
          }
          if (to) {
            return `latest_posts.posted_date <= '${to}'`;
          }
        }
        if (key === 'public_date') {
          const from = value['>='];
          const to = value['<='];
          if (from && to) {
            return `latest_posts.public_date >= '${from}' AND latest_posts.public_date <= '${to}'`;
          }
          if (from) {
            return `latest_posts.public_date >= '${from}'`;
          }
          if (to) {
            return `latest_posts.public_date <= '${to}'`;
          }
        }
        if (key === 'price') {
          const from = value['>='] && value['>='];
          const to = value['<='] && value['<='];
          if (from && to) {
            return `price BETWEEN '${from}' AND '${to}'`;
          }
          if (from) {
            return `price >= '${from}'`;
          }
          if (to) {
            return `price <= '${to}'`;
          }
        }
        return `${key} = '${value}'`;
      })
      .join(' AND ');

    const postsQuery = Post.createQueryBuilder('post')
      .select(
        'post.id, post.user_id, post.post_type, post.title, post.city_id, post.city_title, post.category_id, post.category_title, post.property_id, post.property_title, post.price, post.description, post.is_sticky, post.is_reposted, post.repost_count, post.sticked_date, post.sticky_expires, post.repost_date, post.posted_date, post.public_date, post.expiry_date, post.created_at, post.updated_at, post.deleted_at',
      )
      .addSelect('u.phone as user_phone, u.is_agent as user_is_agent')
      .leftJoin(User, 'u', 'post.user_id = u.id')
      .getQuery();

    const archivedPostsQuery = ArchivePost.createQueryBuilder('post')
      .select(
        'post.id, post.user_id, post.post_type, post.title, post.city_id, post.city_title, post.category_id, post.category_title, post.property_id, post.property_title, post.price, post.description, post.is_sticky, post.is_reposted, post.repost_count, post.sticked_date, post.sticky_expires, post.repost_date, post.posted_date, post.public_date, post.expiry_date, post.created_at, post.updated_at, post.deleted_at',
      )
      .addSelect('u.phone as user_phone, u.is_agent as user_is_agent')
      .leftJoin(User, 'u', 'post.user_id = u.id')
      .getQuery();

    const deletedPostsQuery = DeletedPost.createQueryBuilder('post')
      .select(
        'post.id, post.user_id, post.post_type, post.title, post.city_id, post.city_title, post.category_id, post.category_title, post.property_id, post.property_title, post.price, post.description, post.is_sticky, post.is_reposted, post.repost_count, post.sticked_date, post.sticky_expires, post.repost_date, post.posted_date, post.public_date, post.expiry_date, post.created_at, post.updated_at, post.deleted_at',
      )
      .addSelect('u.phone as user_phone, u.is_agent as user_is_agent')
      .leftJoin(User, 'u', 'post.user_id = u.id')
      .getQuery();

    const unionQuery = `(${postsQuery}) UNION (${archivedPostsQuery}) UNION (${deletedPostsQuery})`;

    const result = await AppDataSource.query(`
      SELECT *
      FROM (${unionQuery}) AS latest_posts
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ORDER BY latest_posts.${Object.keys(order)[0]} DESC
      LIMIT 50
      OFFSET ${offset}
    `);

    const countResult = await AppDataSource.query(`
      SELECT COUNT(*) AS count
      FROM (${unionQuery}) AS latest_posts
      ${whereClause ? `WHERE ${whereClause}` : ''}
    `);

    const totalCount = countResult[0].count;
    posts = result;
    totalPosts = result.length > 0 ? totalCount : 0;

    posts?.forEach((post: any) => {
      post.publicDate = parseTimestamp(post.public_date).parsedDate;
      post.publicTime = parseTimestamp(post.public_date).parsedTime;
      post.postedDate = parseTimestamp(post.posted_date).parsedDate;
      post.postedTime = parseTimestamp(post.posted_date).parsedTime;
      post.expiredDate = parseTimestamp(post.expiry_date).parsedDate;
      post.expiredTime = parseTimestamp(post.expiry_date).parsedTime;
      post.repostedDate = post.repost_date ? parseTimestamp(post.repost_date).parsedDate : null;
      post.repostedTime = post.repost_date ? parseTimestamp(post.repost_date).parsedTime : null;
      post.stickyDate = post.sticked_date ? parseTimestamp(post.sticked_date).parsedDate : null;
      post.stickyTime = post.sticked_date ? parseTimestamp(post.sticked_date).parsedTime : null;
      post.unStickDate = post.sticky_expires ? parseTimestamp(post.sticky_expires).parsedDate : null;
      post.unStickTime = post.sticky_expires ? parseTimestamp(post.sticky_expires).parsedTime : null;
      post.user_phone = post.user?.phone ?? post.user_phone;
      post.deletedDate = post.deleted_at ? parseTimestamp(post.deleted_at).parsedDate : null;
      post.deletedTime = post.deleted_at ? parseTimestamp(post.deleted_at).parsedTime : null;
      delete post.user;
    });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
  }
  const totalPages = totalPosts ? Math.ceil(totalPosts / 50) : null;

  return { posts, totalPages, totalResults: totalPosts };
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
  generatePostId,
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
  removeDeletedPost,
  removePost,
  updatePost,
  updateArchivePost,
  updateDeletedPost,
  updatePostStickyVal,
  updatePostRepostVals,
  updatePostViewCount,
  searchPosts,
  filterPostsForAdmin,
  removeAllPostsOfUser,
  findDeletedPostById,
  unstickPost,
  removeArchivedPostsMedia,
  searchArchivedPosts,
  searchPostCount,
  findPostCountByUserId,
};
