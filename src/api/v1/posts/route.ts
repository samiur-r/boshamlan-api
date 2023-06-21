import express from 'express';

import { isAdminAuth, isUserAuth } from '../../../middlewares/AuthMiddleware';
import upload from '../../../middlewares/FileUploadMiddleware';
import * as PostController from './controller';

const router = express.Router();

router.get('/get-many', PostController.fetchMany);
router.get('/edit/:id', isUserAuth, PostController.fetchOneForEdit);
router.get('/:id', PostController.fetchOne);
router.post('/', [isUserAuth, upload.any()], PostController.insert);
router.post('/get-many', isUserAuth, PostController.fetchMany);
router.post('/archive/get-many', isUserAuth, PostController.fetchManyArchive);
router.post('/increment-post-view', PostController.increasePostCount);
router.put('/', [isUserAuth, upload.any()], PostController.update);
router.delete('/', isUserAuth, PostController.deletePost);
router.post('/temp', [isUserAuth, upload.any()], PostController.insert);
router.post('/stick', isUserAuth, PostController.updatePostToStick);
router.post('/repost', isUserAuth, PostController.rePost);
router.post('/restore', isAdminAuth, PostController.restore);

export default router;
