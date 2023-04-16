/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Between, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual } from 'typeorm';
import cloudinary from '../../../config/cloudinary';
import AppDataSource from '../../../db';
import { deleteMediaFromCloudinary } from '../../../utils/cloudinaryUtils';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { parseTimestamp } from '../../../utils/timestampUtls';
import { updateLocationCountValue } from '../locations/service';
import { IUser } from '../users/interfaces';
import { findUserById } from '../users/service';
import { saveUserLog } from '../user_logs/service';
import { IPost } from './interfaces';
import { ArchivePost } from './models/ArchivePost';
import { DeletedPost } from './models/DeletedPost';
import { Post } from './models/Post';
import { TempPost } from './models/TempPost';

interface PostsWithUser extends IPost {
  post_type?: string;
  user_phone?: string;
  postedDate?: string;
  postedTime?: string;
  expiredDate?: string;
  expiredTime?: string;
  repostedDate?: string | null;
  repostedTime?: string | null;
  stickyDate?: string | null;
  stickyTime?: string | null;
  unStickDate?: string | null;
  unStickTime?: string | null;
  deletedDate?: string | null;
  deletedTime?: string | null;
  publicDate?: string;
  publicTime?: string;
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
    views?: number;
    repost_count?: number;
  },
  user: IUser,
  typeOfCredit: string,
  publicDate?: Date,
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
    public_date: publicDate,
    sticked_date: typeOfCredit === 'sticky' ? today : undefined,
    media: postInfo.media,
    is_sticky: typeOfCredit === 'sticky',
    credit_type: typeOfCredit,
    views: postInfo.views ?? 0,
    repost_count: postInfo.repost_count ?? 0,
    post_type: 'active',
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
  const today = new Date();
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

  const affectedPostIds = affectedPosts.map((post) => post.id);

  if (affectedPostIds && affectedPostIds.length) {
    for (const id of affectedPostIds) {
      await saveUserLog([
        {
          post_id: id,
          transaction: undefined,
          user: undefined,
          activity: 'Post un sticked',
        },
      ]);
    }
  }
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

  const publicDate = new Date();

  await savePost(postInfo, user as IUser, 'sticky', publicDate);
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

  await updateLocationCountValue(postInfo.cityId, 'increment');

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
  const oneMonthFromToday = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );
  const oneWeekFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7,
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );
  const newPost = Post.create({
    ...post,
    sticked_date: isSticky ? today : undefined,
    sticky_expires: isSticky ? oneWeekFromToday : undefined,
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
    where.created_at = {
      '>=': fromCreationDateToFilter,
      '<=': toCreationDateToFilter,
    };
  } else if (fromCreationDateToFilter) {
    where.created_at = {
      '>=': fromCreationDateToFilter,
    };
  } else if (toCreationDateToFilter) {
    where.created_at = {
      '<=': toCreationDateToFilter,
    };
  }

  if (stickyStatusToFilter === -1) where.is_sticky = false;
  else if (stickyStatusToFilter === 1) where.is_sticky = true;

  if (userTypeToFilter && userTypeToFilter === 'regular') where.is_agent = false;
  else if (userTypeToFilter && userTypeToFilter === 'agent') where.is_agent = true;

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
      order.created_at = 'DESC';
      break;
    case 'Sticked':
      order.is_sticky = 'DESC';
      break;
    case 'Repost Date':
      order.repost_date = 'DESC';
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
      order.created_at = 'DESC';
      break;
  }

  try {
    const whereClause = Object.entries(where)
      .map(([key, value]: [string, any]) => {
        if (key === 'is_agent') {
          return `users.${key} = ${value}`;
        }
        if (key === 'created_at') {
          const from = value['>='] && new Date(value['>=']).toISOString();
          const to = value['<='] && new Date(value['<=']).toISOString();
          if (from && to) {
            return `created_at BETWEEN '${from}' AND '${to}'`;
          }
          if (from) {
            return `created_at >= '${from}'`;
          }
          if (to) {
            return `created_at <= '${to}'`;
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

    const query = `SELECT latest_posts.*, (SELECT COUNT(*) FROM (
        SELECT id, title, user_id, post_type, city_id, city_title, category_id, category_title, property_id, property_title, price, description, is_sticky, is_reposted, repost_count, sticked_date, sticky_expires, repost_date, public_date, expiry_date, created_at, updated_at, deleted_at
        FROM posts
        UNION ALL
        SELECT id, title, user_id, post_type, city_id, city_title, category_id, category_title, property_id, property_title, price, description, is_sticky, is_reposted, repost_count, sticked_date, sticky_expires, repost_date, public_date, expiry_date, created_at, updated_at, deleted_at
        FROM archive_posts
        UNION ALL
        SELECT id, title, user_id, post_type, city_id, city_title, category_id, category_title, property_id, property_title, price, description, is_sticky, is_reposted, repost_count, sticked_date, sticky_expires, repost_date, public_date, expiry_date, created_at, updated_at, deleted_at
        FROM deleted_posts
      ) AS latest_posts_count
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ) AS total_count,
        users.id as user_id,
        users.phone as user_phone,
        users.is_agent as user_is_agent
      FROM (
        SELECT posts.id, posts.user_id, posts.post_type, posts.title, posts.city_id, posts.city_title, posts.category_id, posts.category_title, posts.property_id, posts.property_title, posts.price, posts.description, posts.is_sticky, posts.is_reposted, posts.repost_count, posts.sticked_date, posts.sticky_expires, posts.repost_date, posts.public_date, posts.expiry_date, posts.created_at, posts.updated_at, posts.deleted_at
        FROM posts
        UNION ALL
        SELECT archive_posts.id, archive_posts.user_id, archive_posts.post_type, archive_posts.title, archive_posts.city_id, archive_posts.city_title, archive_posts.category_id, archive_posts.category_title, archive_posts.property_id, archive_posts.property_title, archive_posts.price, archive_posts.description, archive_posts.is_sticky, archive_posts.is_reposted, archive_posts.repost_count, archive_posts.sticked_date, archive_posts.sticky_expires, archive_posts.repost_date, archive_posts.public_date, archive_posts.expiry_date, archive_posts.created_at, archive_posts.updated_at, archive_posts.deleted_at
        FROM archive_posts
        UNION ALL
        SELECT deleted_posts.id,  deleted_posts.user_id, deleted_posts.post_type, deleted_posts.title, deleted_posts.city_id, deleted_posts.city_title, deleted_posts.category_id, deleted_posts.category_title, deleted_posts.property_id, deleted_posts.property_title, deleted_posts.price, deleted_posts.description, deleted_posts.is_sticky, deleted_posts.is_reposted, deleted_posts.repost_count, deleted_posts.sticked_date, deleted_posts.sticky_expires, deleted_posts.repost_date, deleted_posts.public_date, deleted_posts.expiry_date, deleted_posts.created_at, deleted_posts.updated_at, deleted_posts.deleted_at
        FROM deleted_posts
      ) AS latest_posts
        LEFT JOIN users ON latest_posts.user_id = users.id
        ${whereClause ? `WHERE ${whereClause}` : ''}
        ORDER BY latest_posts.${Object.keys(order)[0]} DESC
        LIMIT 10
        OFFSET ${offset}
      `;
    const result = await AppDataSource.query(query);
    posts = result;
    totalPosts = result.length > 0 ? result[0].total_count : 0;

    posts?.forEach((post: any) => {
      post.postedDate = parseTimestamp(post.updated_at).parsedDate;
      post.postedTime = parseTimestamp(post.updated_at).parsedTime;
      post.publicDate = parseTimestamp(post.public_date).parsedDate;
      post.publicTime = parseTimestamp(post.public_date).parsedTime;
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
};
