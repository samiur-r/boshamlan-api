import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as CreditController from './controller';

const router = express.Router();

router.get('/sticky-credit', isUserAuth, CreditController.fetchStickyCredits);

export default router;
