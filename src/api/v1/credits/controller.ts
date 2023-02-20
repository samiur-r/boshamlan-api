import { NextFunction, Request, Response } from 'express';
import logger from '../../../utils/logger';
import { findStickyCredits } from './service';

const fetchStickyCredits = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;

  try {
    const stickyCredits = await findStickyCredits(user.id);
    return res.status(200).json({ success: stickyCredits?.sticky });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetchStickyCredits };
