import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

const errorHandler = (
  error: { status: number; message: string },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  logger.error(`${error.message}`);
  const status = error.status || 500;
  return res.status(status).send(error.message);
};

export default errorHandler;
