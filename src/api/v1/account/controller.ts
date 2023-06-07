import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { findAgentByUserId } from '../agents/service';
import { findCreditByUserId } from '../credits/service';
import { findArchivedPostByUserId, findPostCountByUserId, findPosts } from '../posts/service';
import { findUserById } from '../users/service';

const fetch = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;
  let agent = null;

  try {
    const userInfo = await findUserById(user.id);

    if (!userInfo) throw new ErrorHandler(500, 'Something went wrong');

    const credits = await findCreditByUserId(userInfo.id);
    const count = await findPostCountByUserId(userInfo.id);
    const { archivePosts, archiveCount } = await findArchivedPostByUserId(10, 0, userInfo.id);

    if (userInfo.is_agent) agent = await findAgentByUserId(userInfo.id);

    return res
      .status(200)
      .json({ success: { agent, credits, archivePosts, totalPosts: count, totalArchivePosts: archiveCount } });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchCreditAndAgentInfo = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;
  let agent = null;

  try {
    const userInfo = await findUserById(user.id);

    if (!userInfo) throw new ErrorHandler(500, 'Something went wrong');

    const credits = await findCreditByUserId(userInfo.id);

    if (userInfo.is_agent) agent = await findAgentByUserId(userInfo.id);

    return res.status(200).json({ success: { agent, credits } });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetch, fetchCreditAndAgentInfo };
