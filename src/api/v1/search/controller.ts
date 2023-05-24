import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { saveUserLog } from '../user_logs/service';
import { searchArchivedPosts, searchPosts } from '../posts/service';

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

  logger.info(
    `User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`,
  );
  await saveUserLog([
    {
      post_id: undefined,
      transaction: undefined,
      user: undefined,
      activity: `User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`,
    },
  ]);

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
    logger.info(`Posts sent as the searched values successfully`);
    return res.status(200).json({ posts, count });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Failed to send posts as searched for`);
    return next(error);
  }
};

const searchArchived = async (req: Request, res: Response, next: NextFunction) => {
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

  logger.info(
    `User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`,
  );
  await saveUserLog([
    {
      post_id: undefined,
      transaction: undefined,
      user: undefined,
      activity: `User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`,
    },
  ]);

  try {
    const { posts, count } = await searchArchivedPosts(
      limit,
      offset,
      city,
      stateId,
      propertyId,
      categoryId,
      priceRange,
      keyword,
    );
    logger.info(`Archived posts sent as the searched values successfully`);
    return res.status(200).json({ posts, count });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    logger.error(`Failed to send archived posts as searched for`);
    return next(error);
  }
};

export { search, searchArchived };
