import dayJs from 'dayjs';
import { IUser } from '../users/interfaces';
import { Post } from './models/Post';

const savePost = async (
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
  user: IUser,
) => {
  const newPost = Post.create({
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
    user,
  });

  await Post.save(newPost);
};

export { savePost };
