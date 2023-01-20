import express from 'express';

import { isAdminAuth, isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as UserController from './controller';

const router = express.Router();

router.post('/login', UserController.login);
router.post('/register', UserController.register);

export default router;
