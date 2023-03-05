import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { searchPosts } from '../posts/service';

const search = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset, location, propertyType, category, priceRange, keyword } = req.body;

  const propertyId = propertyType ? propertyType.id : undefined;
  const categoryId = category ? category.id : undefined;
  let city = [];
  let stateId;

  if (location && location.length > 1) city = location;
  else if (location && location.length === 1) {
    if (location[0].state_id === null) stateId = location[0].id;
    else city = location;
  }

  try {
    const { posts, count } = await searchPosts(
      limit,
      offset,
      city,
      stateId,
      propertyId,
      categoryId,
      priceRange,
      keyword,
    );
    return res.status(200).json({ posts, count });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { search };
