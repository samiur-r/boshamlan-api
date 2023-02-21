import dayJs from 'dayjs';
import { LessThan } from 'typeorm';
import { IUser } from '../users/interfaces';
import { IPost } from './interfaces';
import { ArchivePost } from './models/ArchivePost';
import { DeletedPost } from './models/DeletedPost';
import { Post } from './models/Post';

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

export { savePost, moveExpiredPosts, saveArchivedPost, saveDeletedPost };
