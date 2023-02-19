import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';

import logger from '../../../utils/logger';
import { findUserById } from '../users/service';
import { deduceCredit } from '../credits/service';
import { postSchema } from './validation';

const insert = async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = req.body;
  const userId = res.locals.user.payload.id;
  console.log(payload);

  try {
    await postSchema.validate(payload);
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    await deduceCredit(user.id, user.is_agent);
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    return next(error);
  }

  return res.status(200).json({ success: true });
};

export { insert };
