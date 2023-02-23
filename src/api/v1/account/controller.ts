import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { IAgent } from '../agents/interfaces';
import { findAgentByUserId } from '../agents/service';
import { findCreditByUserId } from '../credits/service';
import { findArchivedPostByUserId, findPostByUserId } from '../posts/service';
import { findUserById } from '../users/service';

const fetch = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;
  let agent = null;

  try {
    const userInfo = await findUserById(user.id);

    if (!userInfo) throw new ErrorHandler(500, 'Something went wrong');

    const credits = await findCreditByUserId(userInfo.id);
    const posts = await findPostByUserId(userInfo.id);
    const archivedPosts = await findArchivedPostByUserId(userInfo.id);

    if (user.is_agent) agent = await findAgentByUserId(userInfo.id);

    return res.status(200).json({ success: { agent, credits, posts, archivedPosts } });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetch };
