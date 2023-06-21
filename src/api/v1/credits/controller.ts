import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { findCreditByUserId, findFreeCredits, findStickyCredits } from './service';

const fetchStickyCredits = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;

  try {
    const stickyCredits = await findStickyCredits(user.id);
    return res.status(200).json({ success: stickyCredits });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchFreeCredits = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;

  try {
    const freeCredits = await findFreeCredits(user.id);
    return res.status(200).json({ success: freeCredits });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const checkIfUserHasOnlySticky = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;

  try {
    const credits = await findCreditByUserId(user.id);
    if (!credits) throw new ErrorHandler(404, 'User credits not found');
    const isStickyOnly = credits.sticky > 0 && credits.free === 0 && credits.regular === 0 && credits.agent === 0;
    return res.status(200).json({ isStickyOnly });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const checkIfUserHasNoCredits = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;

  try {
    const credits = await findCreditByUserId(user.id);
    if (!credits) throw new ErrorHandler(404, 'User credits not found');
    const hasNoCredits = credits.sticky === 0 && credits.free === 0 && credits.regular === 0 && credits.agent === 0;
    return res.status(200).json({ hasNoCredits });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetchStickyCredits, fetchFreeCredits, checkIfUserHasOnlySticky, checkIfUserHasNoCredits };
