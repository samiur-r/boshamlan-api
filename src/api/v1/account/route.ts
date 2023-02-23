import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as AccountController from './controller';

const router = express.Router();

router.get('/', isUserAuth, AccountController.fetch);

export default router;
