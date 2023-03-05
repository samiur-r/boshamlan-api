import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { Location } from './model';

const fetchAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await Location.find({
      order: {
        id: 'ASC',
      },
    });
    return res.status(200).json({ locations });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetchAll };
