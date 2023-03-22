import { NextFunction, Request, Response } from 'express';
import { uploadMediaToCloudinary } from '../../../utils/cloudinaryUtils';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { alertOnSlack } from '../../../utils/slackUtils';
import { findPosts } from '../posts/service';
import { findUserById } from '../users/service';
import { findAgentById, findAgentByUserId, findManyAgents, updateAgent } from './service';
import { agentSchema } from './validation';

const fetchMany = async (req: Request, res: Response, next: NextFunction) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
  try {
    const { agents, totalRows } = await findManyAgents(limit, offset);
    return res.status(200).json({ agents, totalRows });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await findAgentById(parseInt(req.params.id, 10));
    if (!agent || !agent.user_id) throw new ErrorHandler(500, 'Something went wrong');

    const { posts, count } = await findPosts(10, 0, agent.user_id);
    return res.status(200).json({ agent, posts, totalPosts: count });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const fetch = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user.payload;

  try {
    const agent = await findAgentByUserId(user.id);
    return res.status(200).json({ agent });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { agentInfo } = req.body;
  const userId = res.locals.user.payload.id;

  try {
    const user = await findUserById(userId);
    if (!user || !user.is_agent) throw new ErrorHandler(403, 'You are not an agent');

    await agentSchema.validate(agentInfo);
    if (agentInfo.logo) {
      const url = await uploadMediaToCloudinary(agentInfo.logo, 'agents');
      agentInfo.logo_url = url;
    }
    await updateAgent(agentInfo, user.id);
    const slackMsg = `Agent details edited\n\n ${
      user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''
    }`;
    await alertOnSlack('imp', slackMsg);
    return res.status(200).json({ success: 'Your info is updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    return next(error);
  }
};

export { fetch, fetchById, fetchMany, update };
