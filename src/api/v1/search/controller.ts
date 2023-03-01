import { NextFunction, Request, Response } from 'express';

import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';

const search = async (req: Request, res: Response, next: NextFunction) => {
  const { location, propertyType, category, priceRange, keyword } = req.body;
  console.log(location, propertyType, category, priceRange, keyword);

  try {
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { search };
