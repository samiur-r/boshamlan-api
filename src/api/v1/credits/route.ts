import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as CreditController from './controller';

const router = express.Router();

router.get('/sticky-credit', isUserAuth, CreditController.fetchStickyCredits);
router.get('/free-credit', isUserAuth, CreditController.fetchFreeCredits);
router.get('/user-has-only-sticky', isUserAuth, CreditController.checkIfUserHasOnlySticky);
router.get('/user-has-no-credits', isUserAuth, CreditController.checkIfUserHasNoCredits);

export default router;
