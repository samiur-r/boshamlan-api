import express from 'express';

import * as UserController from './controller';

const router = express.Router();

router.post('/login', UserController.login);
router.get('/logout', UserController.logout);
router.post('/register', UserController.register);
router.post('/check-user', UserController.doesUserExists);
router.post('/password-reset', UserController.resetPassword);
router.delete('/', UserController.removeUser);
router.post('/admin-comment', UserController.findAdminComment);

export default router;
