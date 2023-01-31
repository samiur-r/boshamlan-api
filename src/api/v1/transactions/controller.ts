import { NextFunction, Request, Response } from 'express';

const test = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: 'hello' });
};

export { test };
