/* eslint-disable no-param-reassign */
import { NextFunction, Request, Response } from 'express';

import logger from '../utils/logger';

const errorHandler = (
  error: { name?: string; status: number; message: string },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (error.status) res.status(error.status);
  else res.status(500);

  logger.error(`${error.message}`);
  return res.send(error.message);
};

export default errorHandler;
