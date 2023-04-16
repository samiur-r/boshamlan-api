import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as PostController from './controller';

const router = express.Router();

router.get('/get-many', PostController.fetchMany);
router.get('/edit/:id', isUserAuth, PostController.fetchOneForEdit);
router.get('/:id', PostController.fetchOne);
router.post('/', isUserAuth, PostController.insert);
router.post('/get-many', isUserAuth, PostController.fetchMany);
router.post('/archive/get-many', isUserAuth, PostController.fetchManyArchive);
router.post('/increment-post-view', PostController.increasePostCount);
router.put('/', isUserAuth, PostController.update);
router.delete('/', isUserAuth, PostController.deletePost);
router.post('/temp', isUserAuth, PostController.insert);
router.post('/stick', isUserAuth, PostController.updatePostToStick);
router.post('/repost', isUserAuth, PostController.rePost);

export default router;
