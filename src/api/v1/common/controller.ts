/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { alertOnSlack } from '../../../utils/slackUtils';

const notifySlack = async (req: Request, res: Response, next: NextFunction) => {
  const { message, channel } = req.body;

  try {
    await alertOnSlack(channel, message);
    return res.status(200);
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { notifySlack };
