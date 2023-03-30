import express from 'express';
import { isAdminAuth, isSuperAdminAuth } from '../../../middlewares/AuthMiddleware';

import * as AdminController from './controller';

const router = express.Router();

router.post('/login', AdminController.login);
router.get('/logout', AdminController.logout);
router.post('/register', isSuperAdminAuth, AdminController.register);
router.post('/filter-posts', isAdminAuth, AdminController.filterPosts);
router.post('/stick-post', isAdminAuth, AdminController.stickPost);
router.delete('/delete-post', isAdminAuth, AdminController.deletePost);

export default router;
