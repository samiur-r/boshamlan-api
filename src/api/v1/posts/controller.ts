import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';

import logger from '../../../utils/logger';
import { findUserById } from '../users/service';
import { typeOfCreditToDeduct, updateCredit } from '../credits/service';
import { postSchema } from './validation';
import { savePost } from './service';

const insert = async (req: Request, res: Response, next: NextFunction) => {
  const { postInfo } = req.body;
  const userId = res.locals.user.payload.id;
  const files = req.files as Express.Multer.File[];
  postInfo.media = [];

  if (files && files.length) {
    files.forEach((file) => {
      postInfo.media.push(file.filename);
    });
  }

  try {
    await postSchema.validate(postInfo);
    const user = await findUserById(userId);
    if (!user) throw new ErrorHandler(500, 'Something went wrong');

    const { typeOfCredit, credit } = await typeOfCreditToDeduct(user.id, user.is_agent);
    if (!typeOfCredit) throw new ErrorHandler(402, 'You do not have enough credit');

    await savePost(postInfo, user);
    await updateCredit(userId, typeOfCredit, 1, 'SUB', credit);
    return res.status(200).json({ success: 'Post created successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    return next(error);
  }
};

export { insert };
