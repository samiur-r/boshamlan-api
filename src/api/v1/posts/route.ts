import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import upload from '../../../middlewares/FileUploadMiddleware';
import * as PostController from './controller';

const router = express.Router();

router.get('/:id', isUserAuth, PostController.fetchOne);
router.post('/', [isUserAuth, upload.any()], PostController.insert);
router.put('/', [isUserAuth, upload.any()], PostController.update);
router.post('/temp', [isUserAuth, upload.any()], PostController.insert);
router.post('/stick', [isUserAuth, upload.any()], PostController.updatePostToStick);

export default router;
