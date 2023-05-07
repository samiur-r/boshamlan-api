import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as CreditController from './controller';

const router = express.Router();

router.get('/sticky-credit', isUserAuth, CreditController.fetchStickyCredits);
router.get('/free-credit', isUserAuth, CreditController.fetchFreeCredits);
router.get('/user-has-only-sticky', isUserAuth, CreditController.checkIfUserHasOnlySticky);

export default router;
