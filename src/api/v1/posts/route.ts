import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import upload from '../../../middlewares/FileUploadMiddleware';
import * as PostController from './controller';

const router = express.Router();

router.post('/', [isUserAuth, upload.any()], PostController.insert);

export default router;
