import express from 'express';
import { isAdminAuth, isSuperAdminAuth } from '../../../middlewares/AuthMiddleware';

import * as AdminController from './controller';

const router = express.Router();

router.post('/login', AdminController.login);
router.get('/logout', AdminController.logout);
router.post('/register', isSuperAdminAuth, AdminController.register);
router.post('/filter-posts', isAdminAuth, AdminController.filterPosts);
router.post('/filter-users', isAdminAuth, AdminController.filterUsers);
router.post('/filter-user', isAdminAuth, AdminController.fetchUser);
router.post('/stick-post', isAdminAuth, AdminController.stickPost);
router.delete('/delete-post', isAdminAuth, AdminController.deletePost);
router.post('/get-logs', isAdminAuth, AdminController.fetchLogs);
router.post('/update-credit', isAdminAuth, AdminController.updateCredit);
router.post('/get-user-info', isAdminAuth, AdminController.fetchUserWithAgentInfo);
router.put('/edit-user', isAdminAuth, AdminController.editUser);
router.put('/edit-agent', isAdminAuth, AdminController.editAgent);

export default router;
