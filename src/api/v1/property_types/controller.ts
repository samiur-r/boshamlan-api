import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { Post } from '../posts/models/Post';
import { PropertyType } from './model';

const sortPropertyTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyTypes = await PropertyType.find({
      select: ['id', 'title'],
    });
    const posts = await Post.find({
      select: ['property_id', 'category_id'],
    });
    propertyTypes.forEach((type: any) => {
      let count = 0;
      posts.forEach((post) => {
        if (post.property_id === type.id && post.category_id === parseInt(req.params.category_id, 10)) count += 100;
        else if (post.property_id === type.id) count += 1;
      });
      // eslint-disable-next-line no-param-reassign
      type.count = count;
    });
    propertyTypes.sort((a: any, b: any) => b.count - a.count);

    return res.status(200).json({ propertyTypes });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { sortPropertyTypes };
